import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

/**
 * Generates a unique order ID in the format YARN-XXXXXXXX
 * Uses 8 alphanumeric characters (A-Z, 0-9) for better security
 * @returns {Promise<string>} A unique order ID like YARN-9K2M4P1X
 */
export async function generateOrderId() {
  // Full alphanumeric charset including numbers
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let orderId;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    // Generate random 8-character alphanumeric code
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    orderId = `YARN-${code}`;

    // Check if this ID already exists in Firestore
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('orderId', '==', orderId), limit(1));
      const querySnapshot = await getDocs(q);

      // If no documents found, this ID is unique
      if (querySnapshot.empty) {
        return orderId;
      }

      // If ID exists, try again
      attempts++;
    } catch (error) {
      console.error('Error checking order ID uniqueness:', error);
      // On error, just return the generated ID and let Firestore rules handle collision
      return orderId;
    }
  }

  // Fallback: use UUID-based ID if we couldn't find a unique code
  const fallbackCode = uuidv4().substring(0, 8).toUpperCase();
  return `YARN-${fallbackCode}`;
}

/**
 * Validates an order ID format
 * @param {string} orderId - The order ID to validate
 * @returns {boolean} True if the order ID is valid
 */
export function validateOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string') return false;

  // Must start with YARN- followed by 8 alphanumeric characters
  const pattern = /^YARN-[A-Z0-9]{8}$/;
  return pattern.test(orderId);
}

export default generateOrderId;