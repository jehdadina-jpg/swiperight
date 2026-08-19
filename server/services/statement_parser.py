"""
Statement Parser Service
Extracts transactions from PDF and CSV bank statements
Supports major Indian banks
"""

import re
import csv
import io
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import pdfplumber
import PyPDF2
from dateutil import parser as date_parser
import logging

logger = logging.getLogger(__name__)


class Transaction:
    """Transaction data structure"""
    def __init__(
        self,
        date: datetime,
        merchant: str,
        amount: float,
        transaction_type: str,
        description: str = ""
    ):
        self.date = date
        self.merchant = merchant
        self.amount = amount
        self.transaction_type = transaction_type  # 'debit' or 'credit'
        self.description = description
        self.normalized_merchant = self._normalize_merchant(merchant)
    
    def _normalize_merchant(self, merchant: str) -> str:
        """Normalize merchant names for better categorization"""
        merchant = merchant.upper().strip()
        
        # Common patterns to clean
        patterns = [
            r'\d{2}/\d{2}',  # Dates
            r'[A-Z]{2,}\d{4,}',  # Transaction codes
            r'^\*+',  # Leading asterisks
            r'\*+$',  # Trailing asterisks
            r'^\d+\s*-\s*',  # Leading numbers with dash
            r'\s+POS\s+',  # POS indicators
            r'\s+ATM\s+',  # ATM indicators
            r'\s+UPI\s+',  # UPI indicators
            r'\s+NEFT\s+',  # NEFT indicators
        ]
        
        for pattern in patterns:
            merchant = re.sub(pattern, ' ', merchant)
        
        # Remove extra spaces
        merchant = ' '.join(merchant.split())
        
        # Common merchant name mappings
        merchant_map = {
            'SWIGGY': 'Swiggy',
            'ZOMATO': 'Zomato',
            'AMAZON': 'Amazon',
            'FLIPKART': 'Flipkart',
            'UBER': 'Uber',
            'OLA': 'Ola',
            'BIGBASKET': 'BigBasket',
            'GROFERS': 'Grofers',
            'BLINKIT': 'Blinkit',
            'ZEPTO': 'Zepto',
            'NETFLIX': 'Netflix',
            'PRIME VIDEO': 'Amazon Prime',
            'HOTSTAR': 'Disney+ Hotstar',
            'SPOTIFY': 'Spotify',
            'IRCTC': 'IRCTC',
            'MAKEMYTRIP': 'MakeMyTrip',
            'GOIBIBO': 'Goibibo',
            'BOOKMYSHOW': 'BookMyShow',
            'PAYTM': 'Paytm',
            'PHONEPE': 'PhonePe',
            'GPAY': 'Google Pay',
            'GOOGLEPAY': 'Google Pay',
        }
        
        for key, value in merchant_map.items():
            if key in merchant:
                return value
        
        return merchant.title()
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'date': self.date.isoformat(),
            'merchant': self.merchant,
            'normalized_merchant': self.normalized_merchant,
            'amount': self.amount,
            'transaction_type': self.transaction_type,
            'description': self.description
        }


class StatementParser:
    """Parse bank statements from PDF and CSV"""
    
    def __init__(self):
        self.transactions: List[Transaction] = []
    
    def parse_pdf(self, file_path: str) -> List[Transaction]:
        """Parse PDF statement"""
        logger.info(f"Parsing PDF: {file_path}")
        
        try:
            # Try pdfplumber first (better for tables)
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() or ""
                
                # Try to extract tables
                transactions = []
                for page in pdf.pages:
                    tables = page.extract_tables()
                    for table in tables:
                        transactions.extend(self._parse_table(table))
                
                if transactions:
                    self.transactions = transactions
                    return self._remove_duplicates(transactions)
            
            # Fallback to text extraction
            return self._parse_text(text)
            
        except Exception as e:
            logger.error(f"PDF parsing error: {e}")
            # Fallback to PyPDF2
            return self._parse_pdf_fallback(file_path)
    
    def _parse_pdf_fallback(self, file_path: str) -> List[Transaction]:
        """Fallback PDF parser using PyPDF2"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() or ""
                
                return self._parse_text(text)
        except Exception as e:
            logger.error(f"PDF fallback parsing error: {e}")
            return []
    
    def parse_csv(self, file_path: str) -> List[Transaction]:
        """Parse CSV statement"""
        logger.info(f"Parsing CSV: {file_path}")
        
        transactions = []
        
        try:
            with open(file_path, 'r', encoding='utf-8-sig') as file:
                # Try to detect delimiter
                sample = file.read(1024)
                file.seek(0)
                
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
                
                reader = csv.DictReader(file, delimiter=delimiter)
                
                for row in reader:
                    transaction = self._parse_csv_row(row)
                    if transaction:
                        transactions.append(transaction)
            
            self.transactions = transactions
            return self._remove_duplicates(transactions)
            
        except Exception as e:
            logger.error(f"CSV parsing error: {e}")
            return []
    
    def _parse_csv_row(self, row: Dict) -> Optional[Transaction]:
        """Parse a single CSV row into Transaction"""
        try:
            # Common column name mappings
            date_cols = ['Date', 'date', 'Transaction Date', 'Txn Date', 'Posted Date']
            desc_cols = ['Description', 'description', 'Narration', 'Particulars', 'Details']
            debit_cols = ['Debit', 'debit', 'Debit Amount', 'Withdrawal', 'Dr Amount']
            credit_cols = ['Credit', 'credit', 'Credit Amount', 'Deposit', 'Cr Amount']
            amount_cols = ['Amount', 'amount', 'Transaction Amount', 'Txn Amount']
            
            # Extract date
            date_val = None
            for col in date_cols:
                if col in row and row[col]:
                    date_val = self._parse_date(row[col])
                    break
            
            if not date_val:
                return None
            
            # Extract description/merchant
            merchant = ""
            for col in desc_cols:
                if col in row and row[col]:
                    merchant = row[col].strip()
                    break
            
            if not merchant:
                return None
            
            # Extract amount and type
            amount = 0.0
            transaction_type = "debit"
            
            # Try debit columns
            for col in debit_cols:
                if col in row and row[col]:
                    try:
                        amount = float(self._clean_amount(row[col]))
                        transaction_type = "debit"
                        break
                    except:
                        pass
            
            # Try credit columns if no debit found
            if amount == 0.0:
                for col in credit_cols:
                    if col in row and row[col]:
                        try:
                            amount = float(self._clean_amount(row[col]))
                            transaction_type = "credit"
                            break
                        except:
                            pass
            
            # Try generic amount column
            if amount == 0.0:
                for col in amount_cols:
                    if col in row and row[col]:
                        try:
                            amount = abs(float(self._clean_amount(row[col])))
                            # Try to determine type from amount sign or other indicators
                            break
                        except:
                            pass
            
            if amount == 0.0:
                return None
            
            return Transaction(
                date=date_val,
                merchant=merchant,
                amount=amount,
                transaction_type=transaction_type,
                description=merchant
            )
            
        except Exception as e:
            logger.debug(f"Error parsing CSV row: {e}")
            return None
    
    def _parse_table(self, table: List[List]) -> List[Transaction]:
        """Parse table extracted from PDF"""
        transactions = []
        
        if not table or len(table) < 2:
            return transactions
        
        # Assume first row is header
        headers = [str(h).lower() if h else '' for h in table[0]]
        
        for row in table[1:]:
            if not row or len(row) < 3:
                continue
            
            try:
                # Try to identify columns
                date_val = None
                merchant = ""
                amount = 0.0
                transaction_type = "debit"
                
                # Simple heuristic: date is usually first, amount is last or second last
                for i, cell in enumerate(row):
                    cell_str = str(cell).strip() if cell else ""
                    
                    if not cell_str:
                        continue
                    
                    # Try to parse as date
                    if not date_val:
                        date_val = self._parse_date(cell_str)
                    
                    # Try to parse as amount
                    if self._is_amount(cell_str):
                        try:
                            amount = float(self._clean_amount(cell_str))
                        except:
                            pass
                    
                    # Everything else might be merchant
                    if not self._is_amount(cell_str) and date_val:
                        if len(cell_str) > 3 and not merchant:
                            merchant = cell_str
                
                if date_val and merchant and amount > 0:
                    transactions.append(Transaction(
                        date=date_val,
                        merchant=merchant,
                        amount=amount,
                        transaction_type=transaction_type,
                        description=merchant
                    ))
                    
            except Exception as e:
                logger.debug(f"Error parsing table row: {e}")
                continue
        
        return transactions
    
    def _parse_text(self, text: str) -> List[Transaction]:
        """Parse raw text using regex patterns"""
        transactions = []
        
        # Common patterns for Indian bank statements
        patterns = [
            # Pattern 1: Date Merchant Amount
            r'(\d{2}[-/]\d{2}[-/]\d{2,4})\s+(.+?)\s+([\d,]+\.?\d{0,2})\s*(DR|CR)?',
            # Pattern 2: Date Amount Merchant
            r'(\d{2}[-/]\d{2}[-/]\d{2,4})\s+([\d,]+\.?\d{0,2})\s+(.+?)(?:\n|$)',
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.MULTILINE)
            for match in matches:
                try:
                    groups = match.groups()
                    date_val = self._parse_date(groups[0])
                    
                    if len(groups) >= 3:
                        # Determine which group is merchant vs amount
                        if self._is_amount(groups[1]):
                            amount_str = groups[1]
                            merchant = groups[2].strip()
                        else:
                            merchant = groups[1].strip()
                            amount_str = groups[2]
                        
                        amount = float(self._clean_amount(amount_str))
                        transaction_type = "credit" if (len(groups) > 3 and groups[3] == 'CR') else "debit"
                        
                        if date_val and merchant and amount > 0:
                            transactions.append(Transaction(
                                date=date_val,
                                merchant=merchant,
                                amount=amount,
                                transaction_type=transaction_type,
                                description=merchant
                            ))
                except Exception as e:
                    logger.debug(f"Error parsing text pattern: {e}")
                    continue
        
        return self._remove_duplicates(transactions)
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date string to datetime"""
        try:
            # Try common Indian date formats
            formats = [
                '%d/%m/%Y', '%d-%m-%Y', '%d.%m.%Y',
                '%d/%m/%y', '%d-%m-%y', '%d.%m.%y',
                '%Y-%m-%d', '%d %b %Y', '%d %B %Y',
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_str.strip(), fmt)
                except:
                    pass
            
            # Fallback to dateutil parser
            return date_parser.parse(date_str, dayfirst=True)
            
        except Exception:
            return None
    
    def _clean_amount(self, amount_str: str) -> str:
        """Clean amount string"""
        # Remove currency symbols, commas, spaces
        cleaned = re.sub(r'[₹$,\s]', '', amount_str)
        # Remove parentheses (sometimes used for negative)
        cleaned = cleaned.replace('(', '').replace(')', '')
        return cleaned
    
    def _is_amount(self, text: str) -> bool:
        """Check if text looks like an amount"""
        return bool(re.match(r'^[\d,]+\.?\d{0,2}$', text.strip()))
    
    def _remove_duplicates(self, transactions: List[Transaction]) -> List[Transaction]:
        """Remove duplicate transactions"""
        seen = set()
        unique = []
        
        for txn in transactions:
            # Create a signature for duplicate detection
            signature = (
                txn.date.date(),
                txn.normalized_merchant,
                txn.amount,
                txn.transaction_type
            )
            
            if signature not in seen:
                seen.add(signature)
                unique.append(txn)
        
        logger.info(f"Removed {len(transactions) - len(unique)} duplicate transactions")
        return unique


def parse_statement(file_path: str, file_type: str) -> List[Dict]:
    """Main function to parse statement"""
    parser = StatementParser()
    
    if file_type.lower() == 'pdf':
        transactions = parser.parse_pdf(file_path)
    elif file_type.lower() == 'csv':
        transactions = parser.parse_csv(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")
    
    return [txn.to_dict() for txn in transactions]
