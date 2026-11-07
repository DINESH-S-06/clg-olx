const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

// Middleware to check database connectivity for /api routes (except /api/health)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable: MongoDB is not connected.',
      hint: 'Please update MONGO_URI in your backend/.env with a valid MongoDB Atlas connection string or start your local MongoDB service.',
    });
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Root / Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Campus Marketplace (CLG OLX) Backend API',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)',
      },
      products: {
        getAll: 'GET /api/products?search=&category=&condition=&minPrice=&maxPrice=&isSold=&sort=',
        getById: 'GET /api/products/:id',
        create: 'POST /api/products (Protected)',
        markSold: 'PATCH /api/products/:id/sold (Protected)',
        delete: 'DELETE /api/products/:id (Protected)',
      },
      health: 'GET /api/health',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// Database connection & Server startup
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_marketplace';

// Function to start server with automatic port retry if busy
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Campus Marketplace Server is running!`);
    console.log(`🌐 Local URL:  http://localhost:${port}`);
    console.log(`📦 Health API: http://localhost:${port}/api/health`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${port} is currently in use.`);
      const nextPort = Number(port) + 1;
      console.log(`🔄 Automatically retrying on port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('❌ Server startup error:', err);
    }
  });
};

// Connect to MongoDB with automatic fallback
const connectAndStart = async () => {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 6000 });
    console.log('✅ Successfully connected to MongoDB Atlas database.');
    startServer(DEFAULT_PORT);
  } catch (err) {
    console.warn('\n⚠️  MongoDB Atlas Connection Notice:', err.message);
    console.log('🔄 Activating embedded in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: { spawnTimeoutMS: 60000 },
      });
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log('✅ Successfully connected to In-Memory MongoDB database.');

      // Seed fallback sample data
      const User = require('./models/User');
      const Product = require('./models/Product');
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);

      const stu = await User.create({
        name: 'Dinesh (Student)',
        email: 'student.demo@campus.edu',
        password: hash,
        whatsappNumber: '+919876543210',
        role: 'student',
        hostelBlock: 'Hostel Block B (Boys) - Room 204',
        isVerifiedStudent: true,
      });

      const stf = await User.create({
        name: 'Prof. Rajesh Kumar (Faculty)',
        email: 'staff.demo@campus.edu',
        password: hash,
        whatsappNumber: '+919876543210',
        role: 'staff',
        department: 'Computer Science & Engineering',
        hostelBlock: 'Computer Science Dept - Cabin 108',
        isVerifiedStudent: true,
      });

      const sel = await User.create({
        name: 'Campus Book Store & Stationery',
        email: 'seller.demo@campus.edu',
        password: hash,
        whatsappNumber: '+919876543210',
        role: 'seller',
        storeName: 'KEC Stationery Stall 4',
        hostelBlock: 'KEC Student Center Stall 4',
        isVerifiedStudent: true,
      });

      await Product.create([
        {
          title: 'Engineering Mathematics - Vol 1 & 2 (Latest Edition)',
          description: 'Prescribed textbook for 1st & 2nd sem. Clean pages, no pencil marks, with solved university question papers.',
          category: 'Books',
          condition: 'Like New',
          price: 450,
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
          seller: stu._id,
        },
        {
          title: 'Arduino Uno R3 Starter Kit with Sensor Modules',
          description: 'Complete kit for IoT and Embedded projects. Includes jumper wires, breadboard, LCD display, and ultrasonic sensor.',
          category: 'Electronics',
          condition: 'Brand New',
          price: 950,
          imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80',
          seller: stu._id,
        },
        {
          title: 'Mini Drafter with Sheet Holder Clip & Scale for Engineering Graphics',
          description: 'Official Omega mini drafter for 1st year EG lab. Smooth arm rotation, perfectly calibrated clamp.',
          category: 'Lab Equipment',
          condition: 'Like New',
          price: 320,
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          seller: stf._id,
        },
        {
          title: 'Hostel Study Table with Wooden Top & Metal Frame',
          description: 'Sturdy study desk ideal for hostel rooms. Compact footprint with integrated book rack.',
          category: 'Furniture',
          condition: 'Gently Used',
          price: 1200,
          imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
          seller: sel._id,
        },
        {
          title: 'Hero Sprint 26T Mountain Cycle (Single Speed)',
          description: 'Great for commuting between Mechanical block and Men\'s hostel. Front basket and working bell included.',
          category: 'Others',
          condition: 'Gently Used',
          price: 2400,
          imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
          seller: stu._id,
        },
      ]);

      console.log('✅ Fallback in-memory database seeded with demo listings & users.');
      startServer(DEFAULT_PORT);
    } catch (fallbackErr) {
      console.error('❌ Fallback failed:', fallbackErr);
      startServer(DEFAULT_PORT);
    }
  }
};

connectAndStart();

module.exports = app;
