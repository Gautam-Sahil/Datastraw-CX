const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  customerMessage: String,
  retrievedContext: Array,
  aiGeneratedResponse: String,
  agentEditedResponse: String,
  finalResponse: String,
  responseType: { type: String, enum: ['ai_approved_as_is', 'ai_edited_by_agent', 'manual_agent_reply'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);