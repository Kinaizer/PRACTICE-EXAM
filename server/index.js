require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Request = require('./models/Request');
const AuditLog = require('./models/AuditLog'); // Added

const app = express();
app.use(cors());
app.use(express.json());

// Helper function for logging
const logActivity = async (action, performedBy, target, details) => {
  try {
    const log = new AuditLog({ action, performedBy, target, details });
    await log.save();
  } catch (err) { console.error("Logging error:", err); }
};

// 1. SEED ADMIN
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const defaultAdmin = new User({
        fullName: "System Admin",
        email: "admin@school.com",
        password: "admin123",
        role: "admin",
        isVerified: true
      });
      await defaultAdmin.save();
      console.log("👤 Default Admin created: admin@school.com / admin123");
    }
  } catch (err) { console.error("❌ Error seeding admin:", err); }
};

// 2. DATABASE CONNECTION
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/StudentPortal";
mongoose.connect(MONGO_URI).then(() => {
  console.log("✅ MongoDB Connected");
  seedAdmin();
}).catch(err => console.error("❌ Connection Error:", err));

// --- AUTH ROUTES ---
app.post('/api/signup', async (req, res) => {
  try {
    const user = new User({ ...req.body, isVerified: false });
    await user.save();
    await logActivity("Account Created", user.fullName, user.fullName, "Pending verification");
    res.status(201).json({ message: "Success! Please wait for Admin verification." });
  } catch (err) { res.status(400).json({ message: "Email already exists" }); }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  if (user.role === 'student' && !user.isVerified) {
    return res.status(403).json({ message: "Account pending Admin verification." });
  }
  res.json(user);
});

// --- ADMIN MANAGEMENT ---
app.get('/api/users/unverified', async (req, res) => {
  const users = await User.find({ isVerified: false, role: 'student' });
  res.json(users);
});

app.patch('/api/users/verify/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
  await logActivity("Account Verified", "Admin", user.fullName, "Student can now login");
  res.json(user);
});

app.get('/api/audit-logs', async (req, res) => {
  const logs = await AuditLog.find().sort({ timestamp: -1 });
  res.json(logs);
});

// --- DOCUMENT REQUEST ROUTES ---
app.post('/api/requests', async (req, res) => {
  const newReq = new Request(req.body);
  await newReq.save();
  await logActivity("Document Requested", newReq.fullName, "Office", newReq.documentType);
  res.json(newReq);
});

app.get('/api/requests', async (req, res) => {
  const requests = await Request.find().sort({ createdAt: -1 });
  res.json(requests);
});

app.get('/api/requests/:userId', async (req, res) => {
  const requests = await Request.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(requests);
});

app.patch('/api/requests/:id', async (req, res) => {
  const updated = await Request.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  await logActivity(`Request ${req.body.status}`, "Admin", updated.fullName, updated.documentType);
  res.json(updated);
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));