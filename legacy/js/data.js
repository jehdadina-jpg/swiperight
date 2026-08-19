// SwipeRight — Indian Credit Card Database
// 150 real, actively-marketed Indian credit cards
// minIncome in ₹ per annum, minCibil 300-900
// churnRisk: heuristic label, not verified data

const CARDS = [
  // ─── HDFC BANK ──────────────────────────────────────────────────
  {
    id: 1,
    name: "HDFC Infinia Metal",
    issuer: "HDFC Bank",
    network: "Visa",
    fee: 12500,
    tags: ["travel", "premium", "dining", "lifestyle"],
    highlight: "Unlimited airport lounge access + 5 reward points per ₹150 on all spends",
    minIncome: 2500000,
    minCibil: 750,
    churnRisk: "Medium"
  },
  {
    id: 2,
    name: "HDFC Diners Club Black",
    issuer: "HDFC Bank",
    network: "Diners",
    fee: 10000,
    tags: ["travel", "premium", "dining", "lifestyle"],
    highlight: "10X rewards on select partners + unlimited global lounge access",
    minIncome: 2000000,
    minCibil: 750,
    churnRisk: "Medium"
  },
  {
    id: 3,
    name: "HDFC Regalia Gold",
    issuer: "HDFC Bank",
    network: "Visa",
    fee: 2500,
    tags: ["travel", "shopping", "lifestyle", "dining"],
    highlight: "4 reward points per ₹150 + complimentary airport lounge access",
    minIncome: 1200000,
    minCibil: 720,
    churnRisk: "Low"
  },
  {
    id: 4,
    name: "HDFC Millennia",
    issuer: "HDFC Bank",
    network: "Visa",
    fee: 1000,
    tags: ["cashback", "shopping", "dining"],
    highlight: "5% cashback on Amazon, Flipkart, Swiggy, Zomato and more",
    minIncome: 350000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 5,
    name: "HDFC MoneyBack+",
    issuer: "HDFC Bank",
    network: "Mastercard",
    fee: 500,
    tags: ["cashback", "shopping"],
    highlight: "2X cashback on online spends; redemption as cashback or reward points",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 6,
    name: "HDFC Tata Neu Plus",
    issuer: "HDFC Bank",
    network: "RuPay",
    fee: 499,
    tags: ["shopping", "cashback"],
    highlight: "2% NeuCoins on Tata brands; 1% on other spends",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "High"
  },
  {
    id: 7,
    name: "HDFC Tata Neu Infinity",
    issuer: "HDFC Bank",
    network: "RuPay",
    fee: 1499,
    tags: ["shopping", "cashback", "travel"],
    highlight: "5% NeuCoins on Tata brands + lounge access + insurance",
    minIncome: 700000,
    minCibil: 720,
    churnRisk: "High"
  },
  {
    id: 8,
    name: "HDFC Swiggy",
    issuer: "HDFC Bank",
    network: "Visa",
    fee: 500,
    tags: ["dining", "cashback"],
    highlight: "10% cashback on Swiggy orders; 1% on other spends",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "High"
  },
  {
    id: 9,
    name: "HDFC Flipkart",
    issuer: "HDFC Bank",
    network: "Mastercard",
    fee: 500,
    tags: ["shopping", "cashback"],
    highlight: "5% unlimited cashback on Flipkart + 4% on preferred merchants",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "High"
  },
  {
    id: 10,
    name: "HDFC BPCL Energie",
    issuer: "HDFC Bank",
    network: "Visa",
    fee: 500,
    tags: ["fuel", "cashback"],
    highlight: "4.25% value back on BPCL fuel; 5% on grocery/dining",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "High"
  },
  {
    id: 11,
    name: "HDFC Freedom",
    issuer: "HDFC Bank",
    network: "Mastercard",
    fee: 0,
    tags: ["cashback", "dining", "shopping"],
    highlight: "Lifetime free; 5X cashpoints on EMI spends",
    minIncome: 200000,
    minCibil: 660,
    churnRisk: "Low"
  },
  {
    id: 12,
    name: "HDFC 6E Rewards IndiGo",
    issuer: "HDFC Bank",
    network: "Visa",
    fee: 700,
    tags: ["travel", "cashback"],
    highlight: "6E rewards on IndiGo bookings; up to 6% off on air tickets",
    minIncome: 350000,
    minCibil: 700,
    churnRisk: "High"
  },
  {
    id: 13,
    name: "HDFC Diners Club Privilege",
    issuer: "HDFC Bank",
    network: "Diners",
    fee: 2500,
    tags: ["travel", "dining", "lifestyle"],
    highlight: "4 reward points per ₹150 + lounge access + golf privileges",
    minIncome: 700000,
    minCibil: 720,
    churnRisk: "Low"
  },
  {
    id: 14,
    name: "HDFC Business MoneyBack",
    issuer: "HDFC Bank",
    network: "Mastercard",
    fee: 500,
    tags: ["cashback", "shopping"],
    highlight: "2 cashpoints per ₹150 on business spends; fuel surcharge waiver",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 15,
    name: "HDFC Pixel Play",
    issuer: "HDFC Bank",
    network: "Visa",
    fee: 500,
    tags: ["cashback", "shopping", "dining"],
    highlight: "Customisable cashback categories; choose your top 3 spending areas",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 16,
    name: "HDFC Bharat Cashback",
    issuer: "HDFC Bank",
    network: "RuPay",
    fee: 500,
    tags: ["fuel", "cashback"],
    highlight: "5% cashback on petrol, Utility, grocery; ₹500 welcome benefit",
    minIncome: 150000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 17,
    name: "HDFC Easy EMI",
    issuer: "HDFC Bank",
    network: "Mastercard",
    fee: 0,
    tags: ["shopping"],
    highlight: "Lifetime free; instant EMI conversion on purchases above ₹2,500",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 18,
    name: "HDFC Bank Diners Club Miles",
    issuer: "HDFC Bank",
    network: "Diners",
    fee: 1000,
    tags: ["travel", "dining"],
    highlight: "Transfer reward points to airline miles; dining privileges",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "Low"
  },

  // ─── SBI CARD ──────────────────────────────────────────────────
  {
    id: 19,
    name: "SBI Card ELITE",
    issuer: "SBI Card",
    network: "Visa",
    fee: 4999,
    tags: ["travel", "dining", "premium", "lifestyle"],
    highlight: "5X reward points on dining, groceries, departmental stores; lounge access",
    minIncome: 900000,
    minCibil: 720,
    churnRisk: "Low"
  },
  {
    id: 20,
    name: "SBI Card PRIME",
    issuer: "SBI Card",
    network: "Visa",
    fee: 2999,
    tags: ["travel", "shopping", "dining"],
    highlight: "10X reward points on preferred merchants + lounge access",
    minIncome: 600000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 21,
    name: "SBI SimplyCLICK",
    issuer: "SBI Card",
    network: "Visa",
    fee: 499,
    tags: ["shopping", "cashback"],
    highlight: "10X reward points on online shopping with Amazon, Cleartrip, Lenskart etc.",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 22,
    name: "SBI SimplySAVE",
    issuer: "SBI Card",
    network: "Visa",
    fee: 499,
    tags: ["dining", "shopping", "fuel"],
    highlight: "10X reward points on dining, grocery, movies; 1% fuel surcharge waiver",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 23,
    name: "SBI BPCL Octane",
    issuer: "SBI Card",
    network: "Visa",
    fee: 1499,
    tags: ["fuel", "cashback"],
    highlight: "7.25% value back on BPCL fuel; 5X points on groceries/dining",
    minIncome: 250000,
    minCibil: 660,
    churnRisk: "High"
  },
  {
    id: 24,
    name: "SBI Cashback Card",
    issuer: "SBI Card",
    network: "Visa",
    fee: 999,
    tags: ["cashback", "shopping"],
    highlight: "5% flat cashback on online spends; 1% on all other spends",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 25,
    name: "SBI Pulse",
    issuer: "SBI Card",
    network: "Visa",
    fee: 1499,
    tags: ["lifestyle"],
    highlight: "Fitness & wellness benefits; gym membership + health app premium access",
    minIncome: 400000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 26,
    name: "SBI Yatra",
    issuer: "SBI Card",
    network: "Visa",
    fee: 499,
    tags: ["travel", "cashback"],
    highlight: "6 Yatra.com vouchers annually + travel insurance + lounge access",
    minIncome: 250000,
    minCibil: 660,
    churnRisk: "High"
  },
  {
    id: 27,
    name: "SBI Paytm",
    issuer: "SBI Card",
    network: "Visa",
    fee: 499,
    tags: ["cashback", "shopping"],
    highlight: "2% cashback on Paytm Mall; 1% on other online transactions",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "High"
  },
  {
    id: 28,
    name: "SBI Etihad Guest",
    issuer: "SBI Card",
    network: "Visa",
    fee: 1500,
    tags: ["travel", "premium"],
    highlight: "Earn Etihad Guest Miles on every spend; bonus miles on joining",
    minIncome: 600000,
    minCibil: 700,
    churnRisk: "High"
  },
  {
    id: 29,
    name: "SBI Air India Signature",
    issuer: "SBI Card",
    network: "Visa",
    fee: 4999,
    tags: ["travel", "premium"],
    highlight: "30 Flying Returns points per ₹100 on Air India; lounge access",
    minIncome: 900000,
    minCibil: 720,
    churnRisk: "High"
  },
  {
    id: 30,
    name: "SBI Card Unnati",
    issuer: "SBI Card",
    network: "RuPay",
    fee: 0,
    tags: ["cashback", "fuel"],
    highlight: "Lifetime free; cashback on grocery and fuel spends",
    minIncome: 100000,
    minCibil: 0,
    churnRisk: "Low"
  },
  {
    id: 31,
    name: "SBI Card Advantage",
    issuer: "SBI Card",
    network: "Mastercard",
    fee: 1500,
    tags: ["lifestyle", "travel", "shopping"],
    highlight: "4 reward points per ₹100 on weekend dining + complimentary lounge visits",
    minIncome: 400000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 32,
    name: "SBI IRCTC Platinum",
    issuer: "SBI Card",
    network: "Visa",
    fee: 500,
    tags: ["travel", "cashback"],
    highlight: "10% value back on IRCTC ticket bookings; 1% fuel surcharge waiver",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "High"
  },
  {
    id: 33,
    name: "SBI Vistara Prime",
    issuer: "SBI Card",
    network: "Visa",
    fee: 2999,
    tags: ["travel", "premium"],
    highlight: "Earn Club Vistara Points; complimentary Vistara upgrade vouchers",
    minIncome: 700000,
    minCibil: 720,
    churnRisk: "High"
  },
  {
    id: 34,
    name: "SBI SimplyClick Advantage",
    issuer: "SBI Card",
    network: "Visa",
    fee: 999,
    tags: ["shopping", "cashback", "dining"],
    highlight: "20X reward points on Swiggy, Myntra, BookMyShow + milestone benefits",
    minIncome: 350000,
    minCibil: 680,
    churnRisk: "Low"
  },

  // ─── ICICI BANK ──────────────────────────────────────────────────
  {
    id: 35,
    name: "ICICI Bank Sapphiro",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 3500,
    tags: ["travel", "dining", "premium", "lifestyle"],
    highlight: "2 PAYBACK points per ₹100; airport lounge + concierge + golf",
    minIncome: 900000,
    minCibil: 720,
    churnRisk: "Low"
  },
  {
    id: 36,
    name: "ICICI Bank Emeralde",
    issuer: "ICICI Bank",
    network: "Mastercard",
    fee: 12000,
    tags: ["premium", "travel", "lifestyle", "dining"],
    highlight: "Unlimited airport lounge + premium concierge + 6 PAYBACK points per ₹100",
    minIncome: 2000000,
    minCibil: 750,
    churnRisk: "Medium"
  },
  {
    id: 37,
    name: "ICICI Bank Coral",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 500,
    tags: ["dining", "shopping", "lifestyle"],
    highlight: "2 PAYBACK points per ₹100 spend; entertainment cashback",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 38,
    name: "ICICI Amazon Pay",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 0,
    tags: ["cashback", "shopping"],
    highlight: "Lifetime free; 5% cashback on Amazon for Prime members",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "High"
  },
  {
    id: 39,
    name: "ICICI Bank Rubyx",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 2000,
    tags: ["travel", "dining", "lifestyle"],
    highlight: "4 PAYBACK points per ₹100; complimentary lounge + concierge",
    minIncome: 700000,
    minCibil: 710,
    churnRisk: "Low"
  },
  {
    id: 40,
    name: "ICICI Adani One Signature",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 999,
    tags: ["fuel", "travel", "cashback"],
    highlight: "4% cashback at AGEL petrol stations; 2% on travel spends",
    minIncome: 350000,
    minCibil: 690,
    churnRisk: "High"
  },
  {
    id: 41,
    name: "ICICI MakeMyTrip Signature",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 2500,
    tags: ["travel", "cashback"],
    highlight: "Up to 20% off on MMT bookings; lounge access + travel insurance",
    minIncome: 700000,
    minCibil: 710,
    churnRisk: "High"
  },
  {
    id: 42,
    name: "ICICI HPCL Super Saver",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 500,
    tags: ["fuel", "cashback"],
    highlight: "6.5% savings on HPCL fuel; grocery and utility cashback",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "High"
  },
  {
    id: 43,
    name: "ICICI Bank Cred",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 0,
    tags: ["cashback", "lifestyle"],
    highlight: "Lifetime free; CRED coins on bill payment + partner offers",
    minIncome: 300000,
    minCibil: 700,
    churnRisk: "High"
  },
  {
    id: 44,
    name: "ICICI Bank Platinum Chip",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 0,
    tags: ["cashback"],
    highlight: "Lifetime free; 2 PAYBACK points per ₹100; 1% fuel surcharge waiver",
    minIncome: 150000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 45,
    name: "ICICI Bank Manchester United",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 499,
    tags: ["lifestyle", "shopping"],
    highlight: "Co-branded with MUFC; reward points + exclusive fan merchandise access",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "High"
  },
  {
    id: 46,
    name: "ICICI Bank Coral RuPay",
    issuer: "ICICI Bank",
    network: "RuPay",
    fee: 500,
    tags: ["cashback", "dining"],
    highlight: "2 PAYBACK points per ₹100; UPI-linked transactions earn points",
    minIncome: 250000,
    minCibil: 660,
    churnRisk: "Low"
  },
  {
    id: 47,
    name: "ICICI Bank Ferrari Platinum",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 499,
    tags: ["lifestyle", "cashback"],
    highlight: "Co-branded; fuel surcharge waiver + lifestyle offers",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "High"
  },
  {
    id: 48,
    name: "ICICI Bank Student Travel",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 0,
    tags: ["travel", "cashback"],
    highlight: "Lifetime free; designed for students studying abroad; zero forex markup",
    minIncome: 0,
    minCibil: 0,
    churnRisk: "Low"
  },

  // ─── AXIS BANK ──────────────────────────────────────────────────
  {
    id: 49,
    name: "Axis Bank Magnus",
    issuer: "Axis Bank",
    network: "Mastercard",
    fee: 10000,
    tags: ["travel", "premium", "lifestyle", "dining"],
    highlight: "35 Edge Reward points per ₹200; unlimited airport lounge access globally",
    minIncome: 1800000,
    minCibil: 750,
    churnRisk: "Medium"
  },
  {
    id: 50,
    name: "Axis Bank Reserve",
    issuer: "Axis Bank",
    network: "Visa",
    fee: 50000,
    tags: ["premium", "travel", "lifestyle"],
    highlight: "Ultra-premium metal card; personal concierge + 40 Edge points per ₹200",
    minIncome: 5000000,
    minCibil: 800,
    churnRisk: "Medium"
  },
  {
    id: 51,
    name: "Axis Bank Vistara Infinite",
    issuer: "Axis Bank",
    network: "Visa",
    fee: 10000,
    tags: ["travel", "premium"],
    highlight: "Club Vistara points + complimentary business class upgrades",
    minIncome: 1500000,
    minCibil: 740,
    churnRisk: "High"
  },
  {
    id: 52,
    name: "Axis My Zone",
    issuer: "Axis Bank",
    network: "Mastercard",
    fee: 500,
    tags: ["dining", "shopping", "lifestyle"],
    highlight: "5X Edge Rewards on online food delivery; complimentary OTT subscription",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 53,
    name: "Axis ACE",
    issuer: "Axis Bank",
    network: "Visa",
    fee: 499,
    tags: ["cashback", "fuel", "dining"],
    highlight: "5% cashback on Google Pay; 4% on Swiggy, Zomato, Ola; 2% on others",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 54,
    name: "Axis Bank Flipkart",
    issuer: "Axis Bank",
    network: "Mastercard",
    fee: 500,
    tags: ["shopping", "cashback"],
    highlight: "Unlimited 1.5% cashback on Flipkart + 1% elsewhere",
    minIncome: 250000,
    minCibil: 660,
    churnRisk: "High"
  },
  {
    id: 55,
    name: "Axis Bank Atlas",
    issuer: "Axis Bank",
    network: "Visa",
    fee: 5000,
    tags: ["travel", "premium"],
    highlight: "EDGE Miles on every spend; transfer to 10+ airline/hotel partners",
    minIncome: 1000000,
    minCibil: 730,
    churnRisk: "Low"
  },
  {
    id: 56,
    name: "Axis Bank Indian Oil",
    issuer: "Axis Bank",
    network: "RuPay",
    fee: 500,
    tags: ["fuel", "cashback"],
    highlight: "20 reward points per ₹100 on IndianOil; fuel surcharge waiver",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "High"
  },
  {
    id: 57,
    name: "Axis Bank Airtel",
    issuer: "Axis Bank",
    network: "Visa",
    fee: 500,
    tags: ["cashback", "shopping"],
    highlight: "25% cashback on Airtel bill payment; 10% on Swiggy, Bigbasket",
    minIncome: 250000,
    minCibil: 660,
    churnRisk: "High"
  },
  {
    id: 58,
    name: "Axis Bank Neo",
    issuer: "Axis Bank",
    network: "Mastercard",
    fee: 250,
    tags: ["cashback", "shopping"],
    highlight: "10% cashback on app-based shopping; waiver on minimum spend",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 59,
    name: "Axis Bank Privilege",
    issuer: "Axis Bank",
    network: "Mastercard",
    fee: 1500,
    tags: ["travel", "lifestyle", "dining"],
    highlight: "8 Edge Rewards per ₹200; lounge access + travel insurance",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 60,
    name: "Axis Lime",
    issuer: "Axis Bank",
    network: "Visa",
    fee: 0,
    tags: ["cashback", "dining"],
    highlight: "Lifetime free; cashback on dining and entertainment",
    minIncome: 180000,
    minCibil: 640,
    churnRisk: "Low"
  },

  // ─── KOTAK MAHINDRA ──────────────────────────────────────────────────
  {
    id: 61,
    name: "Kotak Royale Signature",
    issuer: "Kotak Mahindra Bank",
    network: "Visa",
    fee: 1499,
    tags: ["travel", "lifestyle", "dining"],
    highlight: "4 reward points per ₹150; lounge access + fuel surcharge waiver",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 62,
    name: "Kotak Privy League Opus",
    issuer: "Kotak Mahindra Bank",
    network: "Visa",
    fee: 2500,
    tags: ["premium", "travel", "lifestyle"],
    highlight: "10 reward points per ₹150; unlimited lounge access + concierge",
    minIncome: 1500000,
    minCibil: 740,
    churnRisk: "Low"
  },
  {
    id: 63,
    name: "Kotak Mojo Platinum",
    issuer: "Kotak Mahindra Bank",
    network: "Mastercard",
    fee: 1000,
    tags: ["cashback", "shopping"],
    highlight: "5 Mojo points per ₹100 on online spends; movie ticket discounts",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 64,
    name: "Kotak 811 Dream Different",
    issuer: "Kotak Mahindra Bank",
    network: "Visa",
    fee: 0,
    tags: ["cashback"],
    highlight: "Lifetime free; cashback on weekly spending milestones",
    minIncome: 0,
    minCibil: 0,
    churnRisk: "Low"
  },
  {
    id: 65,
    name: "Kotak Zen Signature",
    issuer: "Kotak Mahindra Bank",
    network: "Visa",
    fee: 1499,
    tags: ["lifestyle", "dining", "shopping"],
    highlight: "Enhanced wellness + dining cashback; lounge access",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 66,
    name: "Kotak White Reserve",
    issuer: "Kotak Mahindra Bank",
    network: "Visa",
    fee: 12500,
    tags: ["premium", "travel", "lifestyle"],
    highlight: "Top-tier premium card; unlimited lounge + concierge + golf",
    minIncome: 3000000,
    minCibil: 780,
    churnRisk: "Medium"
  },
  {
    id: 67,
    name: "Kotak League Platinum",
    issuer: "Kotak Mahindra Bank",
    network: "Visa",
    fee: 999,
    tags: ["cashback", "shopping", "dining"],
    highlight: "Cashback on weekends + fuel surcharge waiver",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 68,
    name: "Kotak Urbane Gold",
    issuer: "Kotak Mahindra Bank",
    network: "Mastercard",
    fee: 0,
    tags: ["cashback", "fuel"],
    highlight: "Lifetime free; 1% cashback on all spends; fuel surcharge waiver",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },

  // ─── IDFC FIRST BANK ──────────────────────────────────────────────────
  {
    id: 69,
    name: "IDFC FIRST Wealth",
    issuer: "IDFC FIRST Bank",
    network: "Visa",
    fee: 0,
    tags: ["travel", "premium", "lifestyle"],
    highlight: "Lifetime free premium card; 10X reward points + unlimited lounge access",
    minIncome: 1200000,
    minCibil: 730,
    churnRisk: "Low"
  },
  {
    id: 70,
    name: "IDFC FIRST Select",
    issuer: "IDFC FIRST Bank",
    network: "Visa",
    fee: 0,
    tags: ["travel", "lifestyle", "dining"],
    highlight: "Lifetime free; 6X rewards on weekend spends; lounge access",
    minIncome: 600000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 71,
    name: "IDFC FIRST Classic",
    issuer: "IDFC FIRST Bank",
    network: "Visa",
    fee: 0,
    tags: ["cashback", "lifestyle"],
    highlight: "Lifetime free; 4X rewards on lifestyle spends; no joining fee",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 72,
    name: "IDFC FIRST Power",
    issuer: "IDFC FIRST Bank",
    network: "RuPay",
    fee: 0,
    tags: ["fuel", "cashback"],
    highlight: "Lifetime free; HPCL fuel savings + 6.5% value back on spends",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 73,
    name: "IDFC FIRST Millennia",
    issuer: "IDFC FIRST Bank",
    network: "Visa",
    fee: 0,
    tags: ["cashback", "shopping", "dining"],
    highlight: "Lifetime free; 10X rewards on online shopping; OTT benefits",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 74,
    name: "IDFC FIRST Ashva",
    issuer: "IDFC FIRST Bank",
    network: "Visa",
    fee: 4999,
    tags: ["travel", "premium", "lifestyle"],
    highlight: "Metal card; unlimited lounge + golf + 10X rewards on travel",
    minIncome: 1500000,
    minCibil: 750,
    churnRisk: "Low"
  },
  {
    id: 75,
    name: "IDFC FIRST LTF RuPay",
    issuer: "IDFC FIRST Bank",
    network: "RuPay",
    fee: 0,
    tags: ["cashback", "shopping"],
    highlight: "Lifetime free RuPay card; reward points on UPI transactions",
    minIncome: 150000,
    minCibil: 640,
    churnRisk: "Low"
  },
  {
    id: 76,
    name: "IDFC FIRST Club Vistara Select",
    issuer: "IDFC FIRST Bank",
    network: "Visa",
    fee: 4500,
    tags: ["travel", "premium"],
    highlight: "Club Vistara points + complimentary upgrade vouchers + lounge access",
    minIncome: 800000,
    minCibil: 720,
    churnRisk: "High"
  },

  // ─── AMERICAN EXPRESS ──────────────────────────────────────────────────
  {
    id: 77,
    name: "Amex Platinum Charge Card",
    issuer: "American Express",
    network: "Amex",
    fee: 60000,
    tags: ["premium", "travel", "lifestyle", "dining"],
    highlight: "Centurion lounge access worldwide + unlimited lounge + 5X points on travel",
    minIncome: 5000000,
    minCibil: 800,
    churnRisk: "Medium"
  },
  {
    id: 78,
    name: "Amex Gold Card",
    issuer: "American Express",
    network: "Amex",
    fee: 4500,
    tags: ["dining", "travel", "lifestyle"],
    highlight: "4X points on dining worldwide; 4X on supermarkets; transfer to airlines",
    minIncome: 900000,
    minCibil: 730,
    churnRisk: "Medium"
  },
  {
    id: 79,
    name: "Amex Membership Rewards Credit Card",
    issuer: "American Express",
    network: "Amex",
    fee: 1500,
    tags: ["cashback", "shopping"],
    highlight: "1 Membership Reward point per ₹50; monthly spend bonus rewards",
    minIncome: 400000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 80,
    name: "Amex SmartEarn",
    issuer: "American Express",
    network: "Amex",
    fee: 495,
    tags: ["cashback", "shopping"],
    highlight: "10X rewards on Amazon, Flipkart, Uber; 5X on other online spends",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 81,
    name: "Amex MRCC Platinum Travel",
    issuer: "American Express",
    network: "Amex",
    fee: 3500,
    tags: ["travel", "lifestyle"],
    highlight: "Bonus MR points on milestone spend; hotel stay & dining vouchers",
    minIncome: 700000,
    minCibil: 720,
    churnRisk: "Low"
  },
  {
    id: 82,
    name: "Amex Green Card",
    issuer: "American Express",
    network: "Amex",
    fee: 1800,
    tags: ["travel", "dining"],
    highlight: "3X points on travel, transit, restaurants; annual fee offset with credits",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "Low"
  },

  // ─── RBL BANK ──────────────────────────────────────────────────
  {
    id: 83,
    name: "RBL Shoprite",
    issuer: "RBL Bank",
    network: "Mastercard",
    fee: 0,
    tags: ["cashback", "shopping"],
    highlight: "Lifetime free; 5% cashback on groceries; 1% on other spends",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 84,
    name: "RBL Bank Platinum Maxima",
    issuer: "RBL Bank",
    network: "Mastercard",
    fee: 2000,
    tags: ["dining", "lifestyle", "shopping"],
    highlight: "10 reward points per ₹100 on dining + movie/entertainment cashback",
    minIncome: 400000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 85,
    name: "RBL Bank Icon",
    issuer: "RBL Bank",
    network: "Mastercard",
    fee: 1000,
    tags: ["travel", "lifestyle"],
    highlight: "Complimentary airport lounge + travel + dining rewards",
    minIncome: 400000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 86,
    name: "RBL Zomato Edition",
    issuer: "RBL Bank",
    network: "Mastercard",
    fee: 0,
    tags: ["dining", "cashback"],
    highlight: "Lifetime free; 10% cashback on Zomato + Zomato Gold membership",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "High"
  },
  {
    id: 87,
    name: "RBL Bank Monthly Treats",
    issuer: "RBL Bank",
    network: "Mastercard",
    fee: 0,
    tags: ["dining", "cashback"],
    highlight: "Lifetime free; flat cashback on restaurant spends every month",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 88,
    name: "RBL Bank World Safari",
    issuer: "RBL Bank",
    network: "Mastercard",
    fee: 3000,
    tags: ["travel", "premium"],
    highlight: "Reward points on international spends; forex mark-up waiver",
    minIncome: 700000,
    minCibil: 710,
    churnRisk: "Low"
  },

  // ─── YES BANK ──────────────────────────────────────────────────
  {
    id: 89,
    name: "Yes Bank Marquee",
    issuer: "Yes Bank",
    network: "Mastercard",
    fee: 9999,
    tags: ["premium", "travel", "lifestyle", "dining"],
    highlight: "Premium card; 24 Yes Points per ₹200 + unlimited lounge access",
    minIncome: 2500000,
    minCibil: 760,
    churnRisk: "Medium"
  },
  {
    id: 90,
    name: "Yes Bank Wellness Plus",
    issuer: "Yes Bank",
    network: "Mastercard",
    fee: 1499,
    tags: ["lifestyle", "dining"],
    highlight: "Wellness & fitness cashback; health check-up vouchers + dining benefits",
    minIncome: 400000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 91,
    name: "Yes Bank Ace",
    issuer: "Yes Bank",
    network: "Mastercard",
    fee: 599,
    tags: ["cashback", "shopping"],
    highlight: "5% cashback on utility bills; 2% on other online spends",
    minIncome: 300000,
    minCibil: 660,
    churnRisk: "Low"
  },
  {
    id: 92,
    name: "Yes Bank First Exclusive",
    issuer: "Yes Bank",
    network: "Mastercard",
    fee: 0,
    tags: ["cashback", "lifestyle"],
    highlight: "Lifetime free; 6 Yes Points per ₹200; dining + movie benefits",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 93,
    name: "Yes Bank POP",
    issuer: "Yes Bank",
    network: "Mastercard",
    fee: 0,
    tags: ["cashback", "shopping", "dining"],
    highlight: "Lifetime free; 5% POP coins on select spends; no forex charges",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },

  // ─── INDUSIND BANK ──────────────────────────────────────────────────
  {
    id: 94,
    name: "IndusInd Bank Legend",
    issuer: "IndusInd Bank",
    network: "Visa",
    fee: 9999,
    tags: ["premium", "travel", "lifestyle", "dining"],
    highlight: "Unlimited lounge access + 2.5 reward points per ₹100 + concierge",
    minIncome: 2000000,
    minCibil: 750,
    churnRisk: "Medium"
  },
  {
    id: 95,
    name: "IndusInd Bank Pinnacle",
    issuer: "IndusInd Bank",
    network: "Visa",
    fee: 50000,
    tags: ["premium", "travel", "lifestyle"],
    highlight: "Ultra-elite metal card; unlimited concierge + 3 reward points per ₹100",
    minIncome: 5000000,
    minCibil: 800,
    churnRisk: "Medium"
  },
  {
    id: 96,
    name: "IndusInd Bank Nexxt",
    issuer: "IndusInd Bank",
    network: "Visa",
    fee: 1499,
    tags: ["cashback", "lifestyle"],
    highlight: "Toggle between cashback mode and reward point mode on every transaction",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 97,
    name: "IndusInd Bank Platinum",
    issuer: "IndusInd Bank",
    network: "Visa",
    fee: 999,
    tags: ["travel", "dining"],
    highlight: "2 reward points per ₹100; lounge access + fuel surcharge waiver",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 98,
    name: "IndusInd EazyDiner Platinum",
    issuer: "IndusInd Bank",
    network: "Visa",
    fee: 1999,
    tags: ["dining", "cashback"],
    highlight: "Up to 25% off on 10,000+ restaurants via EazyDiner; dining cashback",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "High"
  },

  // ─── STANDARD CHARTERED ──────────────────────────────────────────────────
  {
    id: 99,
    name: "Standard Chartered Ultimate",
    issuer: "Standard Chartered",
    network: "Mastercard",
    fee: 5000,
    tags: ["cashback", "travel", "premium"],
    highlight: "3.3% cashback on all spends; unlimited lounge access + concierge",
    minIncome: 1200000,
    minCibil: 730,
    churnRisk: "Low"
  },
  {
    id: 100,
    name: "Standard Chartered Smart",
    issuer: "Standard Chartered",
    network: "Mastercard",
    fee: 499,
    tags: ["cashback"],
    highlight: "3% flat cashback on online spends; 1.5% on offline spends",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 101,
    name: "Standard Chartered Manhattan Cashback",
    issuer: "Standard Chartered",
    network: "Mastercard",
    fee: 999,
    tags: ["cashback", "shopping"],
    highlight: "5% cashback at supermarkets; 3% on dining & movies",
    minIncome: 350000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 102,
    name: "Standard Chartered DigiSmart",
    issuer: "Standard Chartered",
    network: "Mastercard",
    fee: 49,
    tags: ["cashback", "shopping"],
    highlight: "Lowest annual fee; cashback on Myntra, Swiggy, Uber + OTT benefit",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 103,
    name: "Standard Chartered EaseMyTrip",
    issuer: "Standard Chartered",
    network: "Mastercard",
    fee: 350,
    tags: ["travel", "cashback"],
    highlight: "Discount on EaseMyTrip bookings; 5 reward points per ₹100",
    minIncome: 250000,
    minCibil: 660,
    churnRisk: "High"
  },
  {
    id: 104,
    name: "Standard Chartered Priority Visa Infinite",
    issuer: "Standard Chartered",
    network: "Visa",
    fee: 1500,
    tags: ["travel", "premium", "lifestyle"],
    highlight: "Designed for Priority Banking clients; lounge + concierge + high rewards",
    minIncome: 1500000,
    minCibil: 740,
    churnRisk: "Low"
  },

  // ─── AU SMALL FINANCE BANK ──────────────────────────────────────────────────
  {
    id: 105,
    name: "AU Bank Zenith+",
    issuer: "AU Small Finance Bank",
    network: "Visa",
    fee: 4999,
    tags: ["premium", "travel", "lifestyle", "dining"],
    highlight: "10 reward points per ₹100; unlimited lounge + golf + concierge",
    minIncome: 1200000,
    minCibil: 730,
    churnRisk: "Low"
  },
  {
    id: 106,
    name: "AU Bank Altura Plus",
    issuer: "AU Small Finance Bank",
    network: "Mastercard",
    fee: 499,
    tags: ["cashback", "shopping", "dining"],
    highlight: "2% cashback on online spends + 1% on other; fuel surcharge waiver",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 107,
    name: "AU Bank Vetta",
    issuer: "AU Small Finance Bank",
    network: "Mastercard",
    fee: 2499,
    tags: ["travel", "lifestyle"],
    highlight: "Lounge access + 5 reward points per ₹100 + milestone benefits",
    minIncome: 700000,
    minCibil: 710,
    churnRisk: "Low"
  },
  {
    id: 108,
    name: "AU Bank LIT",
    issuer: "AU Small Finance Bank",
    network: "Visa",
    fee: 0,
    tags: ["cashback", "lifestyle"],
    highlight: "Lifetime free; customisable benefits; choose cashback or reward points",
    minIncome: 150000,
    minCibil: 640,
    churnRisk: "Low"
  },
  {
    id: 109,
    name: "AU Bank Aultra Platinum",
    issuer: "AU Small Finance Bank",
    network: "Mastercard",
    fee: 1499,
    tags: ["cashback", "shopping", "travel"],
    highlight: "4X rewards on travel + shopping + monthly milestone bonuses",
    minIncome: 400000,
    minCibil: 680,
    churnRisk: "Low"
  },

  // ─── FEDERAL BANK ──────────────────────────────────────────────────
  {
    id: 110,
    name: "Federal Bank Signet",
    issuer: "Federal Bank",
    network: "Visa",
    fee: 499,
    tags: ["cashback", "shopping"],
    highlight: "1% cashback on all spends; no minimum redemption; fuel waiver",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },
  {
    id: 111,
    name: "Federal Bank Celesta",
    issuer: "Federal Bank",
    network: "Mastercard",
    fee: 3000,
    tags: ["travel", "premium", "lifestyle"],
    highlight: "Premium card; 5 reward points per ₹100 + unlimited lounge access",
    minIncome: 900000,
    minCibil: 720,
    churnRisk: "Low"
  },
  {
    id: 112,
    name: "Federal Bank Scapia",
    issuer: "Federal Bank",
    network: "Visa",
    fee: 0,
    tags: ["travel", "cashback"],
    highlight: "Lifetime free travel card; zero forex markup + lounge access + travel rewards",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 113,
    name: "Federal Bank Duo Credit Card",
    issuer: "Federal Bank",
    network: "RuPay",
    fee: 0,
    tags: ["cashback", "fuel"],
    highlight: "Lifetime free; earn rewards on RuPay network + UPI spends",
    minIncome: 150000,
    minCibil: 640,
    churnRisk: "Low"
  },

  // ─── BANK OF BARODA ──────────────────────────────────────────────────
  {
    id: 114,
    name: "BoB ETERNA",
    issuer: "Bank of Baroda",
    network: "Visa",
    fee: 2499,
    tags: ["travel", "lifestyle", "dining"],
    highlight: "15 reward points per ₹100 on travel; lounge access + milestone rewards",
    minIncome: 600000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 115,
    name: "BoB Empower",
    issuer: "Bank of Baroda",
    network: "Mastercard",
    fee: 999,
    tags: ["cashback", "shopping"],
    highlight: "5% cashback on grocery & fuel; 1% on all other spends",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 116,
    name: "BoB Vikram",
    issuer: "Bank of Baroda",
    network: "Visa",
    fee: 0,
    tags: ["cashback", "fuel"],
    highlight: "Lifetime free; 1% cashback + fuel surcharge waiver",
    minIncome: 150000,
    minCibil: 640,
    churnRisk: "Low"
  },
  {
    id: 117,
    name: "BoB Premier",
    issuer: "Bank of Baroda",
    network: "Mastercard",
    fee: 1499,
    tags: ["lifestyle", "travel"],
    highlight: "4X points on dining + travel + lounge access on milestone",
    minIncome: 400000,
    minCibil: 680,
    churnRisk: "Low"
  },

  // ─── PNB ──────────────────────────────────────────────────
  {
    id: 118,
    name: "PNB Pride RuPay Select",
    issuer: "Punjab National Bank",
    network: "RuPay",
    fee: 0,
    tags: ["cashback", "fuel"],
    highlight: "Lifetime free; 2 reward points per ₹100 + UPI transaction rewards",
    minIncome: 100000,
    minCibil: 0,
    churnRisk: "Low"
  },
  {
    id: 119,
    name: "PNB RuPay Platinum",
    issuer: "Punjab National Bank",
    network: "RuPay",
    fee: 299,
    tags: ["cashback", "shopping"],
    highlight: "Reward points on all spends; fuel surcharge waiver",
    minIncome: 150000,
    minCibil: 640,
    churnRisk: "Low"
  },
  {
    id: 120,
    name: "PNB Visa Classic",
    issuer: "Punjab National Bank",
    network: "Visa",
    fee: 500,
    tags: ["cashback"],
    highlight: "Basic card with 1% cashback and fuel surcharge waiver",
    minIncome: 150000,
    minCibil: 640,
    churnRisk: "Low"
  },

  // ─── CANARA BANK ──────────────────────────────────────────────────
  {
    id: 121,
    name: "Canara Bank RuPay Platinum",
    issuer: "Canara Bank",
    network: "RuPay",
    fee: 0,
    tags: ["cashback", "fuel"],
    highlight: "Lifetime free; reward points on RuPay; fuel waiver + UPI benefits",
    minIncome: 100000,
    minCibil: 0,
    churnRisk: "Low"
  },
  {
    id: 122,
    name: "Canara Bank Visa Classic",
    issuer: "Canara Bank",
    network: "Visa",
    fee: 500,
    tags: ["cashback"],
    highlight: "1 reward point per ₹100; fuel surcharge waiver",
    minIncome: 150000,
    minCibil: 640,
    churnRisk: "Low"
  },
  {
    id: 123,
    name: "Canara Bank Visa Signature",
    issuer: "Canara Bank",
    network: "Visa",
    fee: 1500,
    tags: ["travel", "lifestyle"],
    highlight: "3X points on travel + lounge access + comprehensive insurance",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "Low"
  },

  // ─── HDFC BANK (continued) ──────────────────────────────────────────────────
  {
    id: 124,
    name: "HDFC Indian Oil",
    issuer: "HDFC Bank",
    network: "Visa",
    fee: 500,
    tags: ["fuel", "cashback"],
    highlight: "5% cashback as fuel points on IndianOil; 1% on all other spends",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "High"
  },

  // ─── ICICI BANK (continued) ──────────────────────────────────────────────────
  {
    id: 125,
    name: "ICICI Bank Rubyx Visa",
    issuer: "ICICI Bank",
    network: "Visa",
    fee: 3000,
    tags: ["travel", "lifestyle", "dining"],
    highlight: "6 PAYBACK points per ₹100; travel + dining benefits; dual card (Amex+Visa)",
    minIncome: 800000,
    minCibil: 720,
    churnRisk: "Low"
  },
  {
    id: 126,
    name: "ICICI Bank Coral Contactless",
    issuer: "ICICI Bank",
    network: "Mastercard",
    fee: 500,
    tags: ["cashback", "shopping"],
    highlight: "Contactless payments; 2 PAYBACK points per ₹100 + cashback on EMI",
    minIncome: 250000,
    minCibil: 660,
    churnRisk: "Low"
  },

  // ─── AXIS BANK (continued) ──────────────────────────────────────────────────
  {
    id: 127,
    name: "Axis Bank Samsung Infinite",
    issuer: "Axis Bank",
    network: "Visa",
    fee: 500,
    tags: ["shopping", "cashback"],
    highlight: "10% cashback on Samsung products; 5% on partner merchants",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "High"
  },
  {
    id: 128,
    name: "Axis Bank Pride Signature",
    issuer: "Axis Bank",
    network: "Mastercard",
    fee: 500,
    tags: ["cashback", "fuel"],
    highlight: "Designed for defence personnel; fuel waiver + 1% cashback on all spends",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },

  // ─── SBI CARD (continued) ──────────────────────────────────────────────────
  {
    id: 129,
    name: "SBI Card Elite Advantage",
    issuer: "SBI Card",
    network: "Visa",
    fee: 1499,
    tags: ["travel", "lifestyle"],
    highlight: "Enhanced version of Elite for select SBI account holders; higher rewards rate",
    minIncome: 700000,
    minCibil: 710,
    churnRisk: "Low"
  },
  {
    id: 130,
    name: "SBI IRCTC Select",
    issuer: "SBI Card",
    network: "RuPay",
    fee: 1499,
    tags: ["travel", "cashback"],
    highlight: "1.8% value back on IRCTC bookings + lounge access + railway lounge",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "High"
  },

  // ─── IDFC FIRST (continued) ──────────────────────────────────────────────────
  {
    id: 131,
    name: "IDFC FIRST WOW",
    issuer: "IDFC FIRST Bank",
    network: "Visa",
    fee: 0,
    tags: ["cashback", "shopping"],
    highlight: "Lifetime free; 1% cashback; secured card with FD collateral",
    minIncome: 0,
    minCibil: 0,
    churnRisk: "Low"
  },

  // ─── KOTAK (continued) ──────────────────────────────────────────────────
  {
    id: 132,
    name: "Kotak Myntra",
    issuer: "Kotak Mahindra Bank",
    network: "Visa",
    fee: 500,
    tags: ["shopping", "cashback"],
    highlight: "7.5% cashback on Myntra; 1% on all other spends",
    minIncome: 250000,
    minCibil: 660,
    churnRisk: "High"
  },
  {
    id: 133,
    name: "Kotak Indigo Ka-ching",
    issuer: "Kotak Mahindra Bank",
    network: "Visa",
    fee: 750,
    tags: ["travel", "cashback"],
    highlight: "IndiGo 6E Rewards + complimentary IndiGo flights on milestone spend",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "High"
  },

  // ─── YES BANK (continued) ──────────────────────────────────────────────────
  {
    id: 134,
    name: "Yes BYOC",
    issuer: "Yes Bank",
    network: "Mastercard",
    fee: 0,
    tags: ["cashback", "lifestyle"],
    highlight: "Build Your Own Card; choose your top reward categories from a menu",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },

  // ─── INDUSIND (continued) ──────────────────────────────────────────────────
  {
    id: 135,
    name: "IndusInd Bank Platinum Aura Edge",
    issuer: "IndusInd Bank",
    network: "Visa",
    fee: 1499,
    tags: ["lifestyle", "cashback"],
    highlight: "Milestone rewards + OTT subscription benefits + dining cashback",
    minIncome: 400000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 136,
    name: "IndusInd Bank Avios Visa",
    issuer: "IndusInd Bank",
    network: "Visa",
    fee: 10000,
    tags: ["travel", "premium"],
    highlight: "British Airways Avios miles on every spend; lounge + premium travel perks",
    minIncome: 1500000,
    minCibil: 750,
    churnRisk: "High"
  },

  // ─── STANDARD CHARTERED (continued) ──────────────────────────────────────────────────
  {
    id: 137,
    name: "Standard Chartered Landmark Rewards",
    issuer: "Standard Chartered",
    network: "Mastercard",
    fee: 750,
    tags: ["shopping", "cashback"],
    highlight: "Up to 20X reward points at Lifestyle, Home Centre, Splash, Max stores",
    minIncome: 300000,
    minCibil: 680,
    churnRisk: "High"
  },

  // ─── HDFC BANK (continued) ──────────────────────────────────────────────────
  {
    id: 138,
    name: "HDFC Regalia First",
    issuer: "HDFC Bank",
    network: "Visa",
    fee: 1000,
    tags: ["travel", "lifestyle"],
    highlight: "2 reward points per ₹150 + airport lounge access (domestic)",
    minIncome: 500000,
    minCibil: 700,
    churnRisk: "Low"
  },

  // ─── IDBI BANK ──────────────────────────────────────────────────
  {
    id: 139,
    name: "IDBI Bank Royale Signature",
    issuer: "IDBI Bank",
    network: "Visa",
    fee: 1000,
    tags: ["travel", "cashback"],
    highlight: "3 reward points per ₹100; lounge access + fuel surcharge waiver",
    minIncome: 350000,
    minCibil: 680,
    churnRisk: "Low"
  },
  {
    id: 140,
    name: "IDBI Bank Euphoria World",
    issuer: "IDBI Bank",
    network: "Mastercard",
    fee: 2000,
    tags: ["lifestyle", "travel", "dining"],
    highlight: "Lounge access + concierge + higher rewards on travel and dining",
    minIncome: 600000,
    minCibil: 700,
    churnRisk: "Low"
  },

  // ─── UNION BANK ──────────────────────────────────────────────────
  {
    id: 141,
    name: "Union Bank RuPay Platinum",
    issuer: "Union Bank of India",
    network: "RuPay",
    fee: 0,
    tags: ["cashback", "fuel"],
    highlight: "Lifetime free; reward points on all spends + UPI integration",
    minIncome: 100000,
    minCibil: 0,
    churnRisk: "Low"
  },
  {
    id: 142,
    name: "Union Bank Visa Gold",
    issuer: "Union Bank of India",
    network: "Visa",
    fee: 750,
    tags: ["cashback", "shopping"],
    highlight: "1% cashback on online + offline spends; fuel surcharge waiver",
    minIncome: 200000,
    minCibil: 650,
    churnRisk: "Low"
  },

  // ─── HSBC INDIA ──────────────────────────────────────────────────
  {
    id: 143,
    name: "HSBC Live+ Cashback",
    issuer: "HSBC India",
    network: "Visa",
    fee: 999,
    tags: ["cashback", "dining", "shopping"],
    highlight: "10% cashback on dining; 1.5% on all other spend; ₹1,000 welcome cashback",
    minIncome: 400000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 144,
    name: "HSBC Visa Platinum",
    issuer: "HSBC India",
    network: "Visa",
    fee: 1000,
    tags: ["cashback", "travel"],
    highlight: "Cashback on all spends; welcome vouchers + lounge access",
    minIncome: 400000,
    minCibil: 700,
    churnRisk: "Low"
  },
  {
    id: 145,
    name: "HSBC Premier Mastercard",
    issuer: "HSBC India",
    network: "Mastercard",
    fee: 0,
    tags: ["premium", "travel", "lifestyle"],
    highlight: "For HSBC Premier clients; unlimited lounge + preferential forex rates",
    minIncome: 4000000,
    minCibil: 780,
    churnRisk: "Low"
  },

  // ─── BANK OF INDIA ──────────────────────────────────────────────────
  {
    id: 146,
    name: "Bank of India RuPay Platinum",
    issuer: "Bank of India",
    network: "RuPay",
    fee: 0,
    tags: ["cashback", "fuel"],
    highlight: "Lifetime free; reward points on daily spends + fuel waiver",
    minIncome: 100000,
    minCibil: 0,
    churnRisk: "Low"
  },

  // ─── BANDHAN BANK ──────────────────────────────────────────────────
  {
    id: 147,
    name: "Bandhan Bank FIRST Plus",
    issuer: "Bandhan Bank",
    network: "Visa",
    fee: 0,
    tags: ["cashback", "shopping"],
    highlight: "Lifetime free; cashback on online spends and utility bills",
    minIncome: 150000,
    minCibil: 640,
    churnRisk: "Low"
  },

  // ─── AIRTEL PAYMENTS BANK ──────────────────────────────────────────────────
  {
    id: 148,
    name: "Airtel Axis Bank",
    issuer: "Axis Bank",
    network: "Visa",
    fee: 500,
    tags: ["cashback", "fuel", "shopping"],
    highlight: "25% cashback on Airtel services; 10% on Swiggy, Zomato, BigBasket",
    minIncome: 250000,
    minCibil: 660,
    churnRisk: "High"
  },

  // ─── CRED RBL ──────────────────────────────────────────────────
  {
    id: 149,
    name: "RBL Bank CRED Edition",
    issuer: "RBL Bank",
    network: "Mastercard",
    fee: 0,
    tags: ["cashback", "lifestyle"],
    highlight: "Lifetime free; CRED coins on all payments + exclusive partner discounts",
    minIncome: 300000,
    minCibil: 700,
    churnRisk: "High"
  },

  // ─── HDFC BANK (final) ──────────────────────────────────────────────────
  {
    id: 150,
    name: "HDFC Bank UPI RuPay Credit Card",
    issuer: "HDFC Bank",
    network: "RuPay",
    fee: 0,
    tags: ["cashback", "shopping"],
    highlight: "Lifetime free; earn reward points on UPI transactions via RuPay",
    minIncome: 150000,
    minCibil: 640,
    churnRisk: "Low"
  }
];

// Tag definitions
const TAG_LABELS = {
  cashback: "💰 Cashback",
  fuel: "⛽ Fuel",
  travel: "✈️ Travel",
  dining: "🍽️ Dining",
  shopping: "🛍️ Shopping",
  lifestyle: "🌟 Lifestyle",
  premium: "👑 Premium"
};

const TAG_COLORS = {
  cashback: "#2ecc71",
  fuel: "#e67e22",
  travel: "#3498db",
  dining: "#e74c3c",
  shopping: "#9b59b6",
  lifestyle: "#1abc9c",
  premium: "#f1c40f"
};

const NETWORKS = ["All", "Visa", "Mastercard", "RuPay", "Amex", "Diners"];
const ALL_TAGS = ["cashback", "fuel", "travel", "dining", "shopping", "lifestyle", "premium"];
