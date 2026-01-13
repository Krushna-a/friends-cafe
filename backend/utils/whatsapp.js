// Use Meta WhatsApp Business API instead of Twilio
const {
  sendWhatsAppMessage,
  sendOrderConfirmation,
  sendSimpleMessage,
  sendWelcomeMessage,
} = require("./meta-whatsapp");

module.exports = {
  sendWhatsAppMessage,
  sendOrderConfirmation,
  sendSimpleMessage,
  sendWelcomeMessage,
};
