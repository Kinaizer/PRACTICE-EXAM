const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: String,
  studentId: String,
  track: { type: String, enum: ['TVL', 'STEM', 'STEAM', 'ABM'] },
  documentType: String,
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);