const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  customerName: String,
  orderDetails: {
    orderId: String,
    itemName: String,
    status: String,
    deliveredDaysAgo: Number
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);