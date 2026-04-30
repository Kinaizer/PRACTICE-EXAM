require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Request = require('./models/Request');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());

// Set origin to true to dynamically allow your ngrok frontend to talk to this backend
app.use(cors({
  origin: true, 
  credentials: true
}));

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/StudentPortal";
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    seedAdmin();
  })
  .catch(err => console.error("Connection Error:", err));

// --- SEEDING ---
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
      console.log("Default Admin created: admin@school.com / admin123");
    }
  } catch (err) { 
    console.error("Error seeding admin:", err); 
  }
};

// --- ROUTER INITIALIZATION ---
const apiRouter = express.Router();

// --- AUTH ROUTES ---
// Note: These paths should NOT include '/api' because the prefix is added in app.use below
apiRouter.post('/signup', async (req, res) => {
  try {
    const user = new User({ ...req.body, isVerified: false });
    await user.save();
    res.status(201).json({ message: "Success! Please wait for Admin verification." });
  } catch (err) { 
    res.status(400).json({ message: "ID Number or Email already exists or invalid data" }); 
  }
});

apiRouter.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const user = await User.findOne({ 
      $or: [{ idNumber: loginId }, { email: loginId }], 
      password 
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    if (user.role === 'student' && !user.isVerified) {
      return res.status(403).json({ message: "Account pending Admin verification." });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// --- USER MANAGEMENT ---
apiRouter.get('/users/unverified', async (req, res) => {
  try {
    const users = await User.find({ isVerified: false, role: 'student' });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unverified users" });
  }
});

apiRouter.patch('/users/verify/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isVerified: true }, 
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

apiRouter.post('/admin/users', async (req, res) => {
  try {
    const user = new User({ ...req.body, isVerified: true });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: "Failed to create user. Email or ID might exist." });
  }
});

apiRouter.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

apiRouter.patch('/users/:id', async (req, res) => {
  try {
    const { fullName, idNumber, email, password, role, isVerified } = req.body;
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (idNumber !== undefined) updateData.idNumber = idNumber;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (role !== undefined) updateData.role = role;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

apiRouter.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed" });
  }
});

// --- REQUESTS ROUTES ---
apiRouter.post('/requests', async (req, res) => {
  try {
    const newReq = new Request(req.body);
    await newReq.save();
    res.status(201).json(newReq);
  } catch (err) {
    res.status(500).json({ error: "Failed to save request" });
  }
});

apiRouter.get('/requests', async (req, res) => {
  try {
    const { status, userId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

apiRouter.patch('/requests/:id', async (req, res) => {
  try {
    const { status, comment } = req.body;
    const updateData = { status };
    if (comment !== undefined) updateData.comment = comment;
    
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: "Failed to update request" });
  }
});

// --- APPLY THE ROUTER ---
// This applies the '/api' prefix to all routes defined in apiRouter
app.use('/api', apiRouter);

// Root route for connection testing
app.get('/', (req, res) => {
  res.send("SEAIT Clearance Backend is running smoothly!");
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));