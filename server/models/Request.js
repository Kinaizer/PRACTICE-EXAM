const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  fullName: String,
  studentId: String,
  track: { 
    type: String, 
    enum: ['Engineering', 'Architecture', 'Information Technology'] 
  },
  ssgpLink: { 
    type: String, 
    required: [true, 'SSGP Google Drive link is required'] 
  },
  status: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'Checker Approved', 'Org President Approved', 'Governor Approved', 'Disapproved']
  },
  comment: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);