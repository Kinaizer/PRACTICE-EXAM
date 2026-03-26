require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Request = require('./models/Request');

const app = express();
app.use(cors());
app.use(express.json());


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

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/StudentPortal";
mongoose.connect(MONGO_URI).then(() => {
  console.log("✅ MongoDB Connected");
  seedAdmin();
}).catch(err => console.error("❌ Connection Error:", err));

app.post('/api/signup', async (req, res) => {
  try {
    const user = new User({ ...req.body, isVerified: false });
    await user.save();
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

app.get('/api/users/unverified', async (req, res) => {
  const users = await User.find({ isVerified: false, role: 'student' });
  res.json(users);
});

app.patch('/api/users/verify/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
  res.json(user);
});



app.post('/api/requests', async (req, res) => {
  try {
    const newReq = new Request(req.body);
    await newReq.save();

    res.json(newReq);
  } catch (err) {
    res.status(500).json({ error: "Failed to save request" });
  }
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
  try {
    const updated = await Request.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update request" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));