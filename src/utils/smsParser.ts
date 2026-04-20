export interface ParsedTransaction {
  id?: string;
  amount: number;
  type: 'debit' | 'credit' | 'unknown';
  merchant: string;
  category: string;
  account: string;
  date: string;
}

export function parseTransactionalSMS(message: string): ParsedTransaction | null {
  const body = message.toLowerCase();
  
  // Predict transaction type
  let type: 'debit' | 'credit' | 'unknown' = 'unknown';
  if (body.match(/(debited|spent|paid|deducted|sent)/)) {
    type = 'debit';
  } else if (body.match(/(credited|received|added|refunded)/)) {
    type = 'credit';
  }

  // Find amount: matches rs., inr, ₹, amt, or amount followed by digits/decimals
  const amtMatch = message.match(/(?:rs\.?|inr|₹|amt|amount)\s*[:]?\s*([0-9,]+(?:\.[0-9]+)?)/i);
  if (!amtMatch && type === 'unknown') return null; // Very likely not a financial SMS
  
  const amountStr = amtMatch ? amtMatch[1] : '0';
  const amount = parseFloat(amountStr.replace(/,/g, ''));
  
  if (amount === 0) return null;

  // Predict merchant name via regex & context
  let merchant = 'Unknown Entity';
  const merchMatch = message.match(/(?:to|at|info|vpa|merchant)\s+([A-Za-z0-9][A-Za-z0-9\s]+)/i);
  if (merchMatch && merchMatch[1]) {
    merchant = merchMatch[1].trim().split(' ')[0].toUpperCase();
    if (merchant.length < 3 && merchMatch[1].trim().split(' ').length > 1) {
      merchant = merchMatch[1].trim().split(' ')[1].toUpperCase();
    }
  } else if (body.includes('swiggy')) merchant = 'SWIGGY';
  else if (body.includes('zomato')) merchant = 'ZOMATO';
  else if (body.includes('uber')) merchant = 'UBER';
  else if (body.includes('ola')) merchant = 'OLA';
  else if (body.includes('amazon')) merchant = 'AMAZON';

  // Account details
  let account = 'Acc ending ****';
  const accMatch = message.match(/(?:a\/c|acct|account).{0,5}([0-9A-Za-z*]{4,8})/i);
  if (accMatch) {
    account = 'Acc ' + accMatch[1].trim();
  } else if (body.includes('upi')) {
    account = 'UPI Transfer';
  }

  // Categorization via simple NLP rules
  let category = 'Others';
  const b = body;
  const m = merchant.toLowerCase();
  if (/(swiggy|zomato|kfc|mcdonalds|starbucks|food|dining|restaurant|dominos)/i.test(b) || /(swiggy|zomato)/i.test(m)) {
    category = 'Food & Dining';
  } else if (/(uber|ola|rapido|irctc|flight|travel|indigo|makemytrip|cleartrip|train)/i.test(b) || /(uber|ola|rapido)/i.test(m)) {
    category = 'Travel & Transport';
  } else if (/(amazon|flipkart|myntra|reliance|mart|dmart|shopping)/i.test(b)) {
    category = 'Shopping';
  } else if (/(movie|netflix|prime|hotstar|pvr|inox|spotify)/i.test(b)) {
    category = 'Entertainment';
  } else if (/(jio|airtel|vi|recharge|bill|electricity|water|wifi|broadband|bescom|tata sky)/i.test(b)) {
    category = 'Bills & Utilities';
  } else if (/(pharmacy|hospital|apollo|medplus|clinic|health)/i.test(b)) {
    category = 'Healthcare';
  }

  return { 
    id: Math.random().toString(36).substr(2, 9),
    amount, 
    type, 
    merchant, 
    category, 
    account, 
    date: new Date().toISOString() 
  };
}
