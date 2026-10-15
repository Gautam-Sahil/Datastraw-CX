require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('./models/Brand');
const Policy = require('./models/Policy');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const AuditLog = require('./models/AuditLog');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to mongodb for seeding');

    await Brand.deleteMany({});
    await Policy.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await AuditLog.deleteMany({});

  
    const brandA = await Brand.create({ name: 'AuraGlow Skincare' });
    const brandB = await Brand.create({ name: 'HydroPeak Bottles' });

   
    await Policy.insertMany([
      {
        brandId: brandA._id,
        title: 'Return policy',
        content: 'If a bottle or jar arrives broken or damaged, the customer must report it within 48 hours of delivery and share a clear photo of the broken item and shipping box. Once verified, we ship a free replacement within 24 hours.'
      },
      {
        brandId: brandA._id,
        title: 'Refund policy',
        content: 'Refunds are only permitted within 7 days of delivery for unopened products or verified transit damage. Requests made after 7 days of delivery are strictly not eligible for a refund.'
      },
      {
        brandId: brandA._id,
        title: 'Shipping policy',
        content: 'Orders are dispatched within 24 hours via BlueDart and delivered within 3 to 5 business days across India.'
      },
      {
        brandId: brandA._id,
        title: 'Cancellation policy',
        content: 'Orders can only be cancelled within 4 hours of placing the order. Once packed or shipped, cancellations are not allowed.'
      }
    ]);

    await Policy.insertMany([
      {
        brandId: brandB._id,
        title: 'Return policy',
        content: 'Damaged or dented HydroPeak bottles can be returned within 14 days of delivery for an instant replacement or full refund. No shipping box photo is required.'
      },
      {
        brandId: brandB._id,
        title: 'Refund policy',
        content: 'We offer a 30-day no-questions-asked refund policy from the date of delivery. Refunds are credited back to the original payment method within 3 business days.'
      },
      {
        brandId: brandB._id,
        title: 'Shipping policy',
        content: 'Free express shipping on all orders via Delhivery with delivery in 2 to 4 business days.'
      },
      {
        brandId: brandB._id,
        title: 'Cancellation policy',
        content: 'Customers can cancel their order anytime before the courier marks the package Out for Delivery for a 100% instant refund.'
      }
    ]);

   
    const conv1 = await Conversation.create({
      brandId: brandA._id,
      customerName: 'Ananya Sharma',
      orderDetails: {
        orderId: 'AG-1042',
        itemName: 'Vitamin C Glass Serum Bottle (50ml)',
        status: 'Delivered',
        deliveredDaysAgo: 1
      }
    });

    const conv2 = await Conversation.create({
      brandId: brandA._id,
      customerName: 'Rohan Kulkarni',
      orderDetails: {
        orderId: 'AG-0891',
        itemName: 'Niacinamide Night Repair Dropper',
        status: 'Delivered',
        deliveredDaysAgo: 20
      }
    });

    const conv3 = await Conversation.create({
      brandId: brandB._id,
      customerName: 'Vikram Nair',
      orderDetails: {
        orderId: 'HP-9921',
        itemName: 'HydroPeak 1L Insulated Flask',
        status: 'Delivered',
        deliveredDaysAgo: 20
      }
    });

    // Seed initial customer messages
    await Message.insertMany([
      {
        conversationId: conv1._id,
        sender: 'customer',
        text: 'My order was delivered but the bottle is broken. What can I do?'
      },
      {
        conversationId: conv2._id,
        sender: 'customer',
        text: 'I received this 20 days ago. Can I get a refund?'
      },
      {
        conversationId: conv3._id,
        sender: 'customer',
        text: 'My order was delivered but the bottle is broken. What can I do?'
      }
    ]);

    console.log('seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('seed error:', err);
    process.exit(1);
  }
}

seedData();