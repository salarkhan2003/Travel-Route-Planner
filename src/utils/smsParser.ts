export interface ParsedTransaction {
  id?: string;
  amount: number;
  type: 'debit' | 'credit' | 'unknown';
  merchant: string;
  category: string;
  account: string;
  date: string;
  raw?: string;
}

const DEBIT_KEYWORDS = [
  'debited', 'spent', 'paid', 'withdrawn', 'purchase', 'payment', 'transferred', 'sent', 
  'upi', 'debit', 'deducted', 'online at', 'vpa', 'charged', 'txn', 'transaction', 
  'pos', 'atm', 'remitted', 'gpay', 'phonepe', 'paytm', 'swipe', 'money sent',
  'self transfer', 'internal transfer', 'linked account', 'own account'
];

const CREDIT_KEYWORDS = [
  'credited', 'received', 'deposited', 'refund', 'cashback', 'credit', 'reversal', 
  'reimbursement', 'added', 'top-up', 'salary', 'income', 'interest', 'money received'
];

const IGNORE_KEYWORDS = ['requested', 'otp', 'attempt', 'failed', 'insufficient', 'declined', 'limit exceeded'];

const BILL_KEYWORDS = ['due by', 'minimum due', 'overdue', 'total amount payable', 'bill generated', 'cycle ending'];

export function parseTransactionalSMS(message: string): ParsedTransaction | null {
  if (!message) return null;
  const body = message.toLowerCase();

  // 0. Initial Filters
  if (IGNORE_KEYWORDS.some(k => body.includes(k))) return null;
  
  // 1. Check for Bill Obligations (even if no payment happened yet, we track it as a debit obligation if there's an amount)
  const isBillNotice = BILL_KEYWORDS.some(k => body.includes(k));

  // 2. Extract Amount
  // Matches "Rs. 1,000", "INR 500", "₹ 150.50", "Rs 200", etc.
  const amtMatch = message.match(/(?:rs\.?|inr|₹|amt|amount)\s*[:]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) || 
                   message.match(/([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rs\.?|inr|₹)/i);
  
  if (!amtMatch) return null;
  const amount = parseFloat(amtMatch[1].replace(/,/g, ''));
  if (isNaN(amount) || amount <= 0) return null;

  // 3. Predict transaction type
  let type: 'debit' | 'credit' | 'unknown' = 'unknown';
  const isDebit = DEBIT_KEYWORDS.some(k => body.includes(k)) || isBillNotice;
  const isCredit = CREDIT_KEYWORDS.some(k => body.includes(k));
  
  if (isDebit) type = 'debit';
  if (isCredit) type = 'credit';
  if (isDebit && isCredit) {
    if (body.includes('credited') || body.includes('received') || body.includes('refund')) type = 'credit';
    else type = 'debit';
  }

  // 4. Predict merchant
  let merchant = 'Unknown Entity';
  const merchMatch = message.match(/(?:at|to|from|merchant|vpa|info|for)\s+([A-Za-z0-9\s._\-@]{2,40})/i) ||
                     message.match(/(?:paid to|sent to|transfer to|spent at|received from)\s+([A-Za-z0-9\s@]{2,30})/i) ||
                     message.match(/(?:purchase at|shop at|order placed at)\s+([A-Za-z0-9\s]{2,25})/i);

  if (merchMatch && merchMatch[1]) {
    merchant = merchMatch[1].trim().split(/\s{2,}|\n/)[0].toUpperCase();
    merchant = merchant.replace(/X+/g, '').replace(/\*+/g, '').trim();
    if (merchant.length < 2) merchant = 'TRANSACTION';
  }

  // Self Transfer override
  if (body.includes('self transfer') || body.includes('own account') || body.includes('internal transfer')) {
    merchant = 'Self Transfer';
  }

  // 5. Account details
  let account = 'Bank Account';
  const accMatch = message.match(/(?:a\/c|acct?|account|xx|ending|ac)\s*[x\-]*\s*(\d{2,10})/i);
  if (accMatch) {
    account = 'A/c ' + accMatch[1].slice(-4);
  } else if (body.includes('upi') || body.includes('vpa')) {
    account = 'UPI Wallet';
  } else if (body.includes('paytm') || body.includes('wallet')) {
    account = 'Digital Wallet';
  }

  // 6. Categorization (Deep Mapping)
  let category = 'Other';
  const text = (merchant + ' ' + body).toLowerCase();
  
  // Food
  if (/(zomato|swiggy|food|restaurant|cafe|pizza|burger|kfc|mcdonald|domino|biryani|eat|dine|starbucks)/.test(text)) category = 'Food & Dining';
  // Travel
  else if (/(uber|ola|rapido|metro|bus|train|irctc|flight|airline|cab|taxi|petrol|fuel|toll|parking|indigo|pnr|confirmed|railway|bpcl|hpcl|iocl)/.test(text)) category = 'Travel & Transport';
  // Shopping & Ecommerce
  else if (/(amazon|flipkart|myntra|meesho|ajio|nykaa|shop|store|mart|mall|retail|fashion|cloth|dmart|bigbasket|blinkit|zepto|order placed|shipped|delivery)/.test(text)) category = 'Shopping';
  // Entertainment
  else if (/(netflix|spotify|prime|hotstar|youtube|game|steam|playstation|movie|cinema|pvr|inox|bookmyshow)/.test(text)) category = 'Entertainment';
  // Health
  else if (/(hospital|pharmacy|medical|doctor|health|clinic|apollo|medplus|1mg|netmeds)/.test(text)) category = 'Health';
  // Bills
  else if (/(electricity|water|gas|broadband|internet|recharge|bill|jio|airtel|bsnl|vi\b|vodafone|dth|tata sky|dish tv|wi-fi)/.test(text)) category = 'Bills & Utilities';
  // Self Transfer / Same Bank
  else if (/(self transfer|internal transfer|own account|linked account)/.test(text)) category = 'Transfers';

  return { 
    id: `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    amount, 
    type, 
    merchant: merchant || 'Unknown', 
    category, 
    account, 
    date: new Date().toISOString(),
    raw: message
  };
}
