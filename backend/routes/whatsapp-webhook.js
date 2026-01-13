const express = require("express");
const { verifyWebhookSignature } = require("../utils/meta-whatsapp");

const router = express.Router();

/**
 * Webhook verification (GET request from Meta)
 * This is called by Meta to verify your webhook URL
 */
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error("META_WEBHOOK_VERIFY_TOKEN not configured");
    return res.status(500).send("Webhook verify token not configured");
  }

  // Check if mode and token are correct
  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ Webhook verified successfully");
    return res.status(200).send(challenge);
  } else {
    console.error("❌ Webhook verification failed");
    return res.status(403).send("Forbidden");
  }
});

/**
 * Webhook endpoint (POST request from Meta)
 * This receives WhatsApp messages and delivery status updates
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["x-hub-signature-256"];

    // Verify webhook signature for security
    if (signature && !verifyWebhookSignature(req.body, signature)) {
      console.error("❌ Invalid webhook signature");
      return res.status(403).send("Forbidden");
    }

    let body;
    try {
      body = JSON.parse(req.body);
    } catch (error) {
      console.error("❌ Invalid JSON in webhook payload");
      return res.status(400).send("Bad Request");
    }

    console.log("📱 WhatsApp webhook received:", JSON.stringify(body, null, 2));

    // Process webhook data
    if (body.object === "whatsapp_business_account") {
      body.entry?.forEach((entry) => {
        entry.changes?.forEach((change) => {
          if (change.field === "messages") {
            const value = change.value;

            // Handle incoming messages
            if (value.messages) {
              value.messages.forEach((message) => {
                handleIncomingMessage(message, value.metadata);
              });
            }

            // Handle message status updates (delivered, read, etc.)
            if (value.statuses) {
              value.statuses.forEach((status) => {
                handleMessageStatus(status);
              });
            }
          }
        });
      });
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).send("OK");
  }
);

/**
 * Handle incoming WhatsApp messages
 * @param {Object} message - Message object from webhook
 * @param {Object} metadata - Metadata from webhook
 */
function handleIncomingMessage(message, metadata) {
  console.log("📨 Incoming WhatsApp message:", {
    from: message.from,
    type: message.type,
    timestamp: message.timestamp,
    id: message.id,
  });

  // Handle different message types
  switch (message.type) {
    case "text":
      handleTextMessage(message);
      break;
    case "button":
      handleButtonReply(message);
      break;
    case "interactive":
      handleInteractiveReply(message);
      break;
    default:
      console.log(`📱 Received ${message.type} message (not handled)`);
  }
}

/**
 * Handle text messages from customers
 * @param {Object} message - Text message object
 */
function handleTextMessage(message) {
  const text = message.text.body.toLowerCase().trim();
  const from = message.from;

  console.log(`📱 Text message from ${from}: "${text}"`);

  // Handle feedback responses
  if (text.includes("😍") || text.includes("loved")) {
    console.log("😍 Customer loved their experience!");
    // TODO: Store positive feedback in database
  } else if (text.includes("👍") || text.includes("okay")) {
    console.log("👍 Customer had an okay experience");
    // TODO: Store neutral feedback in database
  } else if (text.includes("🔧") || text.includes("improvement")) {
    console.log("🔧 Customer wants improvements");
    // TODO: Store negative feedback and alert staff
  } else {
    console.log("💬 General message from customer");
    // TODO: Forward to customer service or auto-reply
  }
}

/**
 * Handle button replies from customers
 * @param {Object} message - Button message object
 */
function handleButtonReply(message) {
  const buttonId = message.button.payload;
  const from = message.from;

  console.log(`🔘 Button reply from ${from}: ${buttonId}`);

  // Handle button responses based on payload
  switch (buttonId) {
    case "feedback_loved":
      console.log("😍 Customer clicked 'Loved it!' button");
      break;
    case "feedback_okay":
      console.log("👍 Customer clicked 'Okay' button");
      break;
    case "feedback_improve":
      console.log("🔧 Customer clicked 'Needs improvement' button");
      break;
    default:
      console.log(`🔘 Unknown button: ${buttonId}`);
  }
}

/**
 * Handle interactive message replies (lists, etc.)
 * @param {Object} message - Interactive message object
 */
function handleInteractiveReply(message) {
  const interactive = message.interactive;
  const from = message.from;

  console.log(`🎯 Interactive reply from ${from}:`, interactive);

  if (interactive.type === "list_reply") {
    const listId = interactive.list_reply.id;
    console.log(`📋 List selection: ${listId}`);
  } else if (interactive.type === "button_reply") {
    const buttonId = interactive.button_reply.id;
    console.log(`🔘 Interactive button: ${buttonId}`);
  }
}

/**
 * Handle message delivery status updates
 * @param {Object} status - Status object from webhook
 */
function handleMessageStatus(status) {
  console.log("📊 Message status update:", {
    id: status.id,
    status: status.status,
    timestamp: status.timestamp,
    recipient_id: status.recipient_id,
  });

  // Handle different status types
  switch (status.status) {
    case "sent":
      console.log("📤 Message sent successfully");
      break;
    case "delivered":
      console.log("📬 Message delivered to customer");
      break;
    case "read":
      console.log("👀 Message read by customer");
      break;
    case "failed":
      console.log("❌ Message delivery failed");
      // TODO: Handle failed messages (retry, alert, etc.)
      break;
    default:
      console.log(`📊 Unknown status: ${status.status}`);
  }
}

module.exports = router;
