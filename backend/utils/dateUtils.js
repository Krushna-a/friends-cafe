/**
 * Date utilities for consistent timezone handling
 * All dates should be in Indian Standard Time (IST)
 */

/**
 * Get current date/time in IST
 * @returns {Date} Current date in IST
 */
function getCurrentIST() {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(
    now.getTime() + (istOffset - now.getTimezoneOffset() * 60 * 1000)
  );
}

/**
 * Format date for database storage (IST)
 * @returns {string} Formatted date string for database
 */
function getISTDateForDB() {
  const istDate = getCurrentIST();
  return istDate.toISOString().replace("T", " ").slice(0, 16);
}

/**
 * Format date for display in Indian format
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(dateInput) {
  try {
    const date = new Date(dateInput);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateInput?.toString() || "Invalid Date";
  }
}

/**
 * Format date for display purposes
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string for display
 */
function formatDateForDisplay(dateInput) {
  try {
    const date = new Date(dateInput);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid Date";
  }
}

/**
 * Format date for invoice/receipt display
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string for invoices
 */
function formatDateForInvoice(dateInput) {
  try {
    const date = new Date(dateInput);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  } catch (error) {
    console.error("Invoice date formatting error:", error);
    return dateInput?.toString() || "Invalid Date";
  }
}

/**
 * Get IST timestamp for logging
 * @returns {string} Current IST timestamp
 */
function getISTTimestamp() {
  return getCurrentIST().toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

module.exports = {
  getCurrentIST,
  getISTDateForDB,
  formatDateForDisplay,
  formatDateForInvoice,
  getISTTimestamp,
};
