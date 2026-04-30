const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  idNumber: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'ssgp checker', 'org president', 'governor'], default: 'student' },
  organization: { type: String, enum: ['Engineering', 'Architecture', 'Information Technology'] },
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);