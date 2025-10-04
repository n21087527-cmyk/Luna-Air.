/**
 * server.js
 * خادم Node.js لتطبيق الصحة - جاهز للتشغيل بعد تثبيت الحزم المطلوبة.
 */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_website';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, unique: true, required: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const healthProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  age: { type: Number, required: true, min: 0, max: 120 },
  isAthlete: { type: Boolean, default: false },
  illnesses: [{
    name: { type: String, required: true, trim: true },
    diagnosedDate: { type: Date, default: Date.now },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
    notes: { type: String, maxlength: 500 }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const HealthProfile = mongoose.model('HealthProfile', healthProfileSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Access token is required' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, passwordHash });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, username }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ success: true, message: 'User registered', token, user: { username, email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });

    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, message: 'Login successful', token, user: { username: user.username, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await HealthProfile.findOne({ userId: req.user.userId }).populate('userId', 'username email');
    if (!profile) return res.json({ success: true, message: 'No profile found', profile: null });
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { age, isAthlete, illnesses } = req.body;
    if (age === undefined || isAthlete === undefined)
      return res.status(400).json({ success: false, message: 'Age and isAthlete are required' });

    const updateData = { age, isAthlete, lastUpdated: new Date() };
    if (Array.isArray(illnesses)) updateData.illnesses = illnesses;

    const profile = await HealthProfile.findOneAndUpdate(
      { userId: req.user.userId },
      updateData,
      { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'username email');

    res.json({ success: true, message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Endpoint not found' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
