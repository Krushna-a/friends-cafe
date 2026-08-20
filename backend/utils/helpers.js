/**
 * Shared utility functions
 */

/**
 * Normalize phone number to E.164 format (India default)
 * @param {string} mobile - Phone number to normalize
 * @returns {string} Normalized phone number with country code
 * @throws {Error} If mobile is invalid
 */
function normalizePhone(mobile) {
  if (!mobile) throw new Error("Mobile required");
  let phone = String(mobile)
    .trim()
    .replace(/[\s\-()]/g, "");
  if (phone.startsWith("+")) return phone;
  if (/^[6-9]\d{9}$/.test(phone)) return "+91" + phone;
  throw new Error("Invalid mobile number");
}

/**
 * Generate unique order number based on date and timestamp
 * @returns {string} Order number in format YYYYMMDDXXXX
 */
function generateOrderNumber() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const uniqueId = String(Date.now()).slice(-4);
  return `${dateStr}${uniqueId}`;
}

/**
 * Standard error response handler
 * @param {object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} message - Custom error message
 * @param {number} statusCode - HTTP status code (default 500)
 */
function handleError(
  res,
  error,
  message = "Operation failed",
  statusCode = 500,
) {
  console.error(message, error);
  return res.status(statusCode).json({ error: message });
}

module.exports = {
  normalizePhone,
  generateOrderNumber,
  handleError,
};
