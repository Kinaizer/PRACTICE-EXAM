const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  idNumber: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'ssgp checker', 'org president', 'governor'], default: 'student' },
  organization: { type: String, enum: ['Engineering', 'Architecture', 'Information Technology'] },
  financialStanding: { type: String, default: 'Clear' },
  sanctions: { type: String, default: 'None' },
  isVerified: { type: Boolean, default: false }
});

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);