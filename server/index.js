require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const Request = require('./models/Request');
const multer = require('multer');
const path = require('path');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());

// Set origin to true to dynamically allow your ngrok frontend to talk to this backend
app.use(cors({
  origin: true, 
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MULTER SETUP ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

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
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = new User({
        fullName: "System Admin",
        email: "admin@school.com",
        password: "admin123", // the model will hash this before saving
        role: "admin",
        isVerified: true
      });
      await admin.save();
      console.log("Default Admin created: admin@school.com / admin123");
    } else if (!admin.password.startsWith('$2b$')) {
      admin.password = "admin123";
      admin.markModified('password');
      await admin.save();
      console.log("Admin password updated to use bcrypt hashing");
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
    const userData = { ...req.body };
    if (!userData.idNumber) delete userData.idNumber;
    if (!userData.email) delete userData.email;
    const user = new User({ ...userData, isVerified: false });
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
      $or: [{ idNumber: loginId }, { email: loginId }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
    const userData = { ...req.body };
    if (!userData.idNumber) delete userData.idNumber;
    if (!userData.email) delete userData.email;
    const user = new User({ ...userData, isVerified: true });
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
    const { fullName, idNumber, email, password, role, isVerified, organization, financialStanding, sanctions } = req.body;
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (idNumber !== undefined) updateData.idNumber = idNumber || undefined;
    if (email !== undefined) updateData.email = email || undefined;
    if (password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    if (role !== undefined) updateData.role = role;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (organization !== undefined) updateData.organization = organization;
    if (financialStanding !== undefined) updateData.financialStanding = financialStanding;
    if (sanctions !== undefined) updateData.sanctions = sanctions;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Update failed", details: err.message });
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
apiRouter.post('/requests', upload.single('ssgpFile'), async (req, res) => {
  try {
    const requestData = { ...req.body };
    if (req.file) {
      requestData.ssgpLink = `/uploads/${req.file.filename}`;
    }
    const newReq = new Request(requestData);
    await newReq.save();
    res.status(201).json(newReq);
  } catch (err) {
    res.status(500).json({ error: "Failed to save request" });
  }
});

apiRouter.get('/requests', async (req, res) => {
  try {
    const { status, userId, track } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (track) filter.track = track;
    const requests = await Request.find(filter)
      .populate('userId', 'financialStanding sanctions')
      .sort({ createdAt: -1 });
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

apiRouter.delete('/requests/:id', async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete request" });
  }
});

apiRouter.delete('/requests', async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      await Request.deleteMany({ userId });
      return res.json({ message: "User requests deleted successfully" });
    } else {
      await Request.deleteMany({});
      return res.json({ message: "All requests deleted successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete requests" });
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