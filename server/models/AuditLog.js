const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },       // e.g., "Account Verified"
  performedBy: { type: String, required: true },  // Admin's Name
  target: { type: String },                       // Student's Name
  details: { type: String },                      // Extra info
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);