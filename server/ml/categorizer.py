"""
Transaction Categorization Engine
ML-based transaction classifier with rule-based fallback
"""

import re
import pickle
import os
from typing import List, Dict, Tuple, Optional
import logging
from datetime import datetime

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

logger = logging.getLogger(__name__)

# 13 spending categories as per SRS
CATEGORIES = [
    "Dining",
    "Travel",
    "Fuel",
    "Shopping",
    "Utilities",
    "Subscriptions",
    "Healthcare",
    "Entertainment",
    "Education",
    "Bills",
    "Investments",
    "Groceries",
    "Others"
]

# Rule-based patterns for each category
CATEGORY_RULES = {
    "Dining": [
        r'swiggy', r'zomato', r'uber\s*eats', r'restaurant', r'cafe', r'food',
        r'domino', r'mcdonald', r'kfc', r'pizza', r'burger', r'biryani',
        r'dunkin', r'starbucks', r'coffee', r'bar', r'pub', r'dine'
    ],
    "Travel": [
        r'irctc', r'makemytrip', r'goibibo', r'yatra', r'cleartrip',
        r'uber', r'ola', r'rapido', r'flight', r'airline', r'indigo',
        r'spicejet', r'air\s*india', r'vistara', r'hotel', r'resort',
        r'oyo', r'treebo', r'train', r'bus', r'redbus', r'abhibus'
    ],
    "Fuel": [
        r'petrol', r'diesel', r'fuel', r'hp\s*petrol', r'bharat\s*petroleum',
        r'indian\s*oil', r'shell', r'reliance\s*petrol', r'essar',
        r'bpcl', r'hpcl', r'iocl', r'cng', r'gas\s*station'
    ],
    "Shopping": [
        r'amazon', r'flipkart', r'myntra', r'ajio', r'meesho',
        r'snapdeal', r'tata\s*cliq', r'nykaa', r'shopping', r'mall',
        r'store', r'retail', r'fashion', r'clothing', r'apparel',
        r'shoes', r'electronics', r'mobile', r'laptop'
    ],
    "Groceries": [
        r'bigbasket', r'grofers', r'blinkit', r'zepto', r'dunzo',
        r'swiggy\s*instamart', r'grocery', r'supermarket', r'reliance\s*fresh',
        r'dmart', r'more', r'spencer', r'nature.*basket', r'vegetable',
        r'fruit', r'milk', r'bread'
    ],
    "Utilities": [
        r'electricity', r'water', r'gas\s*bill', r'broadband', r'internet',
        r'mobile\s*recharge', r'airtel', r'jio', r'vodafone', r'bsnl',
        r'phone\s*bill', r'postpaid', r'utility', r'municipal'
    ],
    "Subscriptions": [
        r'netflix', r'prime\s*video', r'hotstar', r'disney', r'zee5',
        r'sony\s*liv', r'spotify', r'youtube\s*premium', r'apple\s*music',
        r'subscription', r'membership', r'gym', r'fitness', r'cult.*fit'
    ],
    "Healthcare": [
        r'hospital', r'clinic', r'doctor', r'pharmacy', r'medical',
        r'apollo', r'medplus', r'netmeds', r'pharmeasy', r'health',
        r'medicine', r'diagnostic', r'lab', r'pathology', r'insurance.*health'
    ],
    "Entertainment": [
        r'bookmyshow', r'paytm\s*insider', r'movie', r'cinema', r'pvr',
        r'inox', r'theatre', r'concert', r'event', r'ticket', r'game',
        r'steam', r'playstation', r'xbox', r'nintendo'
    ],
    "Education": [
        r'school', r'college', r'university', r'tuition', r'course',
        r'udemy', r'coursera', r'unacademy', r'byjus', r'vedantu',
        r'education', r'training', r'learning', r'book', r'stationery'
    ],
    "Bills": [
        r'bill\s*payment', r'insurance', r'emi', r'loan', r'credit\s*card',
        r'tax', r'rent', r'maintenance', r'society', r'challan'
    ],
    "Investments": [
        r'mutual\s*fund', r'sip', r'stock', r'share', r'zerodha',
        r'groww', r'upstox', r'angel\s*one', r'icicidirect', r'investment',
        r'demat', r'trading', r'equity', r'fd', r'fixed\s*deposit'
    ],
}


class TransactionCategorizer:
    """Hybrid categorization engine with rule-based and ML-based classification"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or "ml/models/categorizer_model.pkl"
        self.vectorizer_path = "ml/models/categorizer_vectorizer.pkl"
        
        self.model: Optional[RandomForestClassifier] = None
        self.vectorizer: Optional[TfidfVectorizer] = None
        
        # Load model if exists
        self._load_model()
    
    def categorize(self, merchant: str, description: str = "") -> Tuple[str, float]:
        """
        Categorize a transaction
        Returns: (category, confidence_score)
        """
        text = f"{merchant} {description}".lower().strip()
        
        # Try rule-based first
        rule_category = self._rule_based_categorization(text)
        if rule_category:
            return rule_category, 0.95  # High confidence for rule-based
        
        # Fallback to ML-based if model is available
        if self.model and self.vectorizer:
            ml_category, confidence = self._ml_based_categorization(text)
            if confidence > 0.5:  # Threshold for ML confidence
                return ml_category, confidence
        
        # Ultimate fallback
        return "Others", 0.3
    
    def _rule_based_categorization(self, text: str) -> Optional[str]:
        """Rule-based categorization using regex patterns"""
        text = text.lower()
        
        # Check each category's patterns
        for category, patterns in CATEGORY_RULES.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    logger.debug(f"Rule match: {pattern} -> {category}")
                    return category
        
        return None
    
    def _ml_based_categorization(self, text: str) -> Tuple[str, float]:
        """ML-based categorization using trained model"""
        try:
            # Vectorize text
            features = self.vectorizer.transform([text])
            
            # Predict
            prediction = self.model.predict(features)[0]
            probabilities = self.model.predict_proba(features)[0]
            confidence = max(probabilities)
            
            logger.debug(f"ML prediction: {prediction} (confidence: {confidence:.2f})")
            return prediction, float(confidence)
            
        except Exception as e:
            logger.error(f"ML categorization error: {e}")
            return "Others", 0.0
    
    def categorize_batch(self, transactions: List[Dict]) -> List[Dict]:
        """Categorize a batch of transactions"""
        categorized = []
        
        for txn in transactions:
            merchant = txn.get('merchant', '') or txn.get('normalized_merchant', '')
            description = txn.get('description', '')
            
            category, confidence = self.categorize(merchant, description)
            
            txn_copy = txn.copy()
            txn_copy['category'] = category
            txn_copy['confidence_score'] = confidence
            categorized.append(txn_copy)
        
        logger.info(f"Categorized {len(categorized)} transactions")
        return categorized
    
    def train_model(self, training_data: List[Tuple[str, str]]):
        """
        Train the ML model
        training_data: List of (text, category) tuples
        """
        logger.info(f"Training categorizer with {len(training_data)} samples")
        
        if len(training_data) < 50:
            logger.warning("Insufficient training data for ML model")
            return
        
        # Prepare data
        texts, labels = zip(*training_data)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, random_state=42, stratify=labels
        )
        
        # Create vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=500,
            ngram_range=(1, 2),
            min_df=2
        )
        
        # Fit vectorizer
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)
        
        # Train model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train_vec, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train_vec, y_train)
        test_score = self.model.score(X_test_vec, y_test)
        
        logger.info(f"Model trained - Train accuracy: {train_score:.3f}, Test accuracy: {test_score:.3f}")
        
        # Save model
        self._save_model()
    
    def _load_model(self):
        """Load trained model from disk"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
                self.model = joblib.load(self.model_path)
                self.vectorizer = joblib.load(self.vectorizer_path)
                logger.info("Categorizer model loaded successfully")
            else:
                logger.info("No pre-trained model found, will use rule-based categorization")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = None
            self.vectorizer = None
    
    def _save_model(self):
        """Save trained model to disk"""
        try:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.vectorizer, self.vectorizer_path)
            logger.info("Model saved successfully")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def detect_recurring_subscriptions(self, transactions: List[Dict]) -> List[Dict]:
        """Detect recurring subscriptions from transaction patterns"""
        # Group by normalized merchant
        merchant_groups = {}
        for txn in transactions:
            merchant = txn.get('normalized_merchant', txn.get('merchant', ''))
            if merchant not in merchant_groups:
                merchant_groups[merchant] = []
            merchant_groups[merchant].append(txn)
        
        recurring = []
        for merchant, txns in merchant_groups.items():
            if len(txns) >= 2:
                # Check if amounts are similar and dates are regular
                amounts = [txn['amount'] for txn in txns]
                avg_amount = sum(amounts) / len(amounts)
                
                # Check if amounts are within 10% variance
                if all(abs(amt - avg_amount) / avg_amount < 0.1 for amt in amounts):
                    # Mark as subscription
                    for txn in txns:
                        if txn.get('category') == 'Others':
                            txn['category'] = 'Subscriptions'
                            txn['confidence_score'] = 0.85
                            txn['is_recurring'] = True
                    
                    recurring.extend(txns)
        
        logger.info(f"Detected {len(recurring)} recurring subscription transactions")
        return transactions


def create_synthetic_training_data() -> List[Tuple[str, str]]:
    """Create synthetic training data for initial model training"""
    training_data = []
    
    # Generate samples for each category
    samples = {
        "Dining": [
            "swiggy food delivery", "zomato restaurant", "dominos pizza",
            "starbucks coffee", "mcdonald fast food", "kfc chicken",
            "restaurant bill payment", "cafe latte", "hotel dining"
        ],
        "Travel": [
            "uber ride", "ola cab", "irctc train ticket", "indigo flight",
            "makemytrip hotel booking", "oyo rooms", "bus ticket redbus",
            "petrol uber", "airport parking", "hotel taj"
        ],
        "Fuel": [
            "hp petrol pump", "bharat petroleum fuel", "indian oil diesel",
            "shell petrol", "reliance petrol", "bpcl fuel station"
        ],
        "Shopping": [
            "amazon online shopping", "flipkart purchase", "myntra fashion",
            "reliance digital", "croma electronics", "decathlon sports"
        ],
        "Groceries": [
            "bigbasket grocery", "dmart supermarket", "reliance fresh",
            "more supermarket", "zepto quick delivery", "blinkit groceries"
        ],
        "Utilities": [
            "airtel mobile recharge", "jio broadband", "electricity bill",
            "water bill payment", "gas cylinder", "broadband internet"
        ],
        "Subscriptions": [
            "netflix subscription", "amazon prime membership", "spotify premium",
            "gym membership cultfit", "youtube premium", "disney hotstar"
        ],
        "Healthcare": [
            "apollo pharmacy", "netmeds medicine", "hospital bill",
            "diagnostic center", "health insurance premium"
        ],
        "Entertainment": [
            "bookmyshow movie ticket", "pvr cinema", "concert ticket",
            "playstation store", "steam games"
        ],
        "Education": [
            "udemy course", "school fees", "book purchase", "coursera subscription"
        ],
        "Bills": [
            "credit card payment", "loan emi", "insurance premium",
            "society maintenance", "rent payment"
        ],
        "Investments": [
            "mutual fund sip", "zerodha trading", "groww investment",
            "fixed deposit", "stock purchase"
        ],
    }
    
    for category, texts in samples.items():
        for text in texts:
            training_data.append((text, category))
    
    return training_data


# Initialize global categorizer
categorizer = TransactionCategorizer()

# Train with synthetic data if no model exists
if categorizer.model is None:
    synthetic_data = create_synthetic_training_data()
    if len(synthetic_data) > 0:
        categorizer.train_model(synthetic_data)
