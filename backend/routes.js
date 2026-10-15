const express = require('express');
const { OpenAI } = require('openai');
const Brand = require('./models/Brand');
const Policy = require('./models/Policy');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const AuditLog = require('./models/AuditLog');

const router = express.Router();


const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});


router.post('/seed', async (req, res) => {
  await Brand.deleteMany({});
  await Policy.deleteMany({});
  
  const brandA = await Brand.create({ name: 'AuraGlow Skincare' });
  const brandB = await Brand.create({ name: 'HydroPeak Bottles' });

  await Policy.create([
    { brandId: brandA._id, title: 'Refund Policy', content: 'Refunds are only permitted within 7 days of delivery. No exceptions.' },
    { brandId: brandA._id, title: 'Return Policy', content: 'Broken items must be reported within 48 hours of delivery with a photo.' },
    { brandId: brandB._id, title: 'Refund Policy', content: 'Generous 30-day no-questions-asked refund window.' },
    { brandId: brandB._id, title: 'Shipping Policy', content: 'Free instant replacement for damaged bottles within 14 days.' }
  ]);

  res.json({ message: 'Database seeded successfully with Brands and Policies!' });
});


router.post('/generate-reply', async (req, res) => {
  const { conversationId, brandId, customerMessage, orderDetails } = req.body;

  try {
 
    const policies = await Policy.find({ brandId });
    const policyContext = policies.map(p => `[${p.title}]: ${p.content}`).join('\n');

   
    const systemPrompt = `
      You are a helpful customer support agent for the brand. 
      Here are the brand's exact policies:
      ${policyContext}
      
      Here are the customer's order details:
      ${JSON.stringify(orderDetails)}

      RULES:
      1. Answer the customer's message based ONLY on the provided policies.
      2. If the customer asks something not in the policies, do NOT guess. Set groundingStatus to "MISSING_KB_INFO".
      3. If the customer's request violates a policy (e.g. asking for a refund after the allowed days), politely explain the policy. Set groundingStatus to "POLICY_VIOLATION".
      4. Respond in valid JSON format ONLY.
      
      Output JSON Format:
      {
        "groundingStatus": "GROUNDED" | "POLICY_VIOLATION" | "MISSING_KB_INFO",
        "agentWarning": "Leave empty if grounded. If policy violation or missing info, write a short 1 sentence warning for the agent.",
        "suggestedReply": "The actual text message you would send to the customer."
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free", // COMPLETELY FREE MODEL
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: customerMessage }
      ],
      response_format: { type: "json_object" } // Force JSON output
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    res.json({
      aiResponse,
      retrievedContext: policyContext
    });

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});


router.post('/audit-log', async (req, res) => {
  const log = await AuditLog.create(req.body);
  res.json(log);
});

module.exports = router;