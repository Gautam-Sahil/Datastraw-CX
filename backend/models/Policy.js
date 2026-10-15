const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
});

module.exports = mongoose.model('Policy', policySchema);