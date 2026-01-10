import crypto from 'crypto';

export const generateFriendCode = (name) => {
  // 1. Sanitize the Name
  // "Mostafa IT" -> "MOSTAFAIT" -> take first 4 chars -> "MOST"
  // If name is blank or symbols, default to 'USER'
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = cleanName.substring(0, 4) || 'USER';
  
  // 2. Generate Random 4-Digit Number
  // crypto.randomInt is safer and more random than Math.random()
  const randomNum = crypto.randomInt(1000, 9999);
  
  // 3. Combine them
  // Result: "MOST-4821"
  return `${prefix}-${randomNum}`;
};
