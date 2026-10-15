const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Policy = require('../models/Policy');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const AuditLog = require('../models/AuditLog');

const openrouterKey = process.env.OPENROUTER_API_KEY;

router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/policies/:brandId', async (req, res) => {
  try {
    const policies = await Policy.find({ brandId: req.params.brandId });
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/policies', async (req, res) => {
  try {
    const { brandId, title, content } = req.body;
    const policy = await Policy.create({ brandId, title, content });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/policies/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const updated = await Policy.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { returnDocument: 'after' }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/policies/:id', async (req, res) => {
  try {
    await Policy.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find().populate('brandId');
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/conversations/:id/order', async (req, res) => {
  try {
    const { deliveredDaysAgo } = req.body;
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    conv.orderDetails.deliveredDaysAgo = Number(deliveredDaysAgo);
    await conv.save();
    const populated = await Conversation.findById(conv._id).populate('brandId');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/messages/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { conversationId, sender, text } = req.body;
    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    const lastCustomerMsg = await Message.findOne({ conversationId, sender: 'customer' }).sort({ createdAt: -1 });
    const newMsg = await Message.create({ conversationId, sender, text });
    if (sender === 'agent') {
      await AuditLog.create({
        conversationId,
        brandId: conv.brandId,
        customerMessage: lastCustomerMsg ? lastCustomerMsg.text : 'N/A',
        retrievedContext: [],
        aiGeneratedResponse: null,
        agentEditedResponse: null,
        finalResponse: text,
        responseType: 'manual_agent_reply'
      });
    }
    res.json(newMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function retrieveBrandPolicies(allBrandPolicies, customerText) {
  const query = (customerText || '').toLowerCase();
  const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'what', 'this', 'have', 'from', 'with', 'ok', 'okay', 'thanks', 'yes']);
  const words = query.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  const intentKeywords = {
    return: ['return', 'broken', 'damaged', 'shattered', 'leaking', 'dented', 'replace', 'replacement', 'bottle', 'defective'],
    refund: ['refund', 'money', 'back', 'return', 'broken', 'damaged', 'days', 'received', 'delivered'],
    shipping: ['shipping', 'ship', 'delivery', 'delivered', 'track', 'courier', 'when', 'arrive', 'address', 'office', 'change'],
    cancellation: ['cancel', 'cancellation', 'stop', 'mistake']
  };
  const matched = [];
  for (const policy of allBrandPolicies) {
    const titleLower = policy.title.toLowerCase();
    const contentLower = policy.content.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (titleLower.includes(w) || contentLower.includes(w)) {
        score += 2;
      }
      for (const [category, synonyms] of Object.entries(intentKeywords)) {
        if (synonyms.includes(w) && titleLower.includes(category)) {
          score += 3;
        }
      }
    }
    if (score > 0) {
      matched.push({ policy, score });
    }
  }
  matched.sort((a, b) => b.score - a.score);
  return matched.map(m => m.policy);
}

router.post('/ai/generate', async (req, res) => {
  try {
    const { conversationId } = req.body;
    const conv = await Conversation.findById(conversationId).populate('brandId');
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    const customerMessages = messages.filter(m => m.sender === 'customer');
    const recentCustomerContext = customerMessages.map(m => m.text).join(' ');
    const lastCustomerMessageObj = customerMessages[customerMessages.length - 1];
    const latestCustomerText = lastCustomerMessageObj ? lastCustomerMessageObj.text : '';
    const brandPolicies = await Policy.find({ brandId: conv.brandId._id });
    const relevantPolicies = retrieveBrandPolicies(brandPolicies, recentCustomerContext);

    if (relevantPolicies.length === 0) {
      return res.json({
        customerMessage: latestCustomerText,
        retrievedContext: [],
        guardrailStatus: 'MISSING_KB_INFO',
        guardrailWarning: `No matching policy found in ${conv.brandId.name} Knowledge Base for this conversation. Do NOT guess facts—verify manually.`,
        suggestedReply: `Hi ${conv.customerName}, thank you for reaching out. Let me check with our specialist team on that and get back to you shortly.`,
        generationSource: 'DETERMINISTIC_FALLBACK'
      });
    }

    const contextBlock = relevantPolicies.map(p => `[${p.title}]: ${p.content}`).join('\n\n');
    const systemPrompt = `You are a customer support AI assistant for the brand "${conv.brandId.name}".
You must ONLY use the provided Brand Knowledge Base policies and Order Information below.

BRAND KNOWLEDGE BASE FOR ${conv.brandId.name}:
${contextBlock}

CUSTOMER & ORDER INFORMATION:
- Customer Name: ${conv.customerName}
- Order ID: ${conv.orderDetails.orderId}
- Item: ${conv.orderDetails.itemName}
- Order Status: ${conv.orderDetails.status}
- Delivered Days Ago: ${conv.orderDetails.deliveredDaysAgo} days ago

STRICT GUARDRAIL RULES:
1. ALWAYS read the Conversation History and answer the customer's EXACT LATEST question directly. 
2. If they mention changing their address (e.g. to Andheri East), acknowledge the new address in your reply!
3. Check "Delivered Days Ago" against the Knowledge Base. If they want a refund and it is past the allowed window, set guardrailStatus to "POLICY_RESTRICTION" and DO NOT promise a refund.
4. If they ask about something not in the KB (like address changes), set guardrailStatus to "MISSING_KB_INFO" and tell them you will check with a supervisor to update their address.
5. Otherwise, set guardrailStatus to "GROUNDED" and write a helpful reply following the policy.

Respond ONLY in valid JSON format exactly like this, with NO markdown formatting:
{
  "guardrailStatus": "GROUNDED",
  "guardrailWarning": "Agent note here about eligibility or address updates",
  "suggestedReply": "Customer reply here acknowledging their specific request"
}`;

    const chatTranscript = messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');
    let aiResult = null;
    let generationSource = 'DETERMINISTIC_FALLBACK';

    if (openrouterKey) {
      try {
        const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Datastraw CX'
          },
          body: JSON.stringify({
            model: 'openrouter/free',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Conversation History:\n${chatTranscript}\n\nDraft a custom reply responding specifically to the LATEST message.` }
            ],
            temperature: 0.1
          })
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        let rawText = data.choices[0].message.content.trim();
        rawText = rawText.replace(/^```json\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```\$/i, '');
        
        aiResult = JSON.parse(rawText);
        generationSource = 'OPENROUTER_AI';
      } catch (llmErr) {
        console.error('\n❌ OPENROUTER API ERROR:', llmErr.message, '\n');
      }
    }

    if (!aiResult) {
      const refundPolicy = brandPolicies.find(p => p.title.toLowerCase().includes('refund'));
      const returnPolicy = brandPolicies.find(p => p.title.toLowerCase().includes('return'));
      const refundText = refundPolicy ? refundPolicy.content : '';
      const returnText = returnPolicy ? returnPolicy.content : '';
      const dayMatch = refundText.match(/(\d+)\s*[-\s]?day/i);
      const allowedRefundDays = dayMatch ? parseInt(dayMatch[1], 10) : 7;
      const deliveredDays = conv.orderDetails.deliveredDaysAgo;
      
      if (deliveredDays > allowedRefundDays) {
        aiResult = {
          guardrailStatus: 'POLICY_RESTRICTION',
          guardrailWarning: `Guardrail Triggered: Order was delivered ${deliveredDays} days ago, which exceeds ${conv.brandId.name}'s ${allowedRefundDays}-day policy window.`,
          suggestedReply: `Hi ${conv.customerName}, thank you for contacting ${conv.brandId.name}. Per our policy, refunds are only permitted within ${allowedRefundDays} days of delivery. Since your order was delivered ${deliveredDays} days ago, I cannot approve a refund directly, but I can check with a supervisor.`
        };
      } else {
        aiResult = {
          guardrailStatus: 'GROUNDED',
          guardrailWarning: `Order delivered ${deliveredDays} day(s) ago — eligible under ${conv.brandId.name}'s ${allowedRefundDays}-day policy window.`,
          suggestedReply: `Hi ${conv.customerName}, I am sorry to hear about the issue with your ${conv.orderDetails.itemName}. Based on ${conv.brandId.name}'s policy: ${returnText || refundText} Please let me know how you would like to proceed!`
        };
      }
    }

    res.json({
      customerMessage: latestCustomerText,
      retrievedContext: relevantPolicies.map(p => ({ title: p.title, content: p.content })),
      guardrailStatus: aiResult.guardrailStatus,
      guardrailWarning: aiResult.guardrailWarning,
      suggestedReply: aiResult.suggestedReply,
      generationSource
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai/approve', async (req, res) => {
  try {
    const { conversationId, customerMessage, retrievedContext, aiGeneratedResponse, finalResponse } = req.body;
    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    const wasEdited = aiGeneratedResponse.trim() !== finalResponse.trim();
    const savedMessage = await Message.create({ conversationId, sender: 'agent', text: finalResponse });
    const log = await AuditLog.create({
      conversationId,
      brandId: conv.brandId,
      customerMessage,
      retrievedContext,
      aiGeneratedResponse,
      agentEditedResponse: wasEdited ? finalResponse : null,
      finalResponse,
      responseType: wasEdited ? 'ai_edited_by_agent' : 'ai_approved_as_is'
    });
    res.json({ message: savedMessage, auditLog: log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('brandId').populate('conversationId').sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;