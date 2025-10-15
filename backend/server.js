require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const { startScheduler } = require('./utils/scheduler');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.set('io', io);

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  next();
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB Connected');
    // ✅ Start scheduler after DB connection
    startScheduler();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const freelancerRoutes = require('./routes/freelancerRoute');
const companyRoutes = require('./routes/companyRoute');
const jobRoutes = require('./routes/jobRoute');
const applicationRoutes = require('./routes/applicationRoute');
const chatRoutes = require('./routes/chatRoute');
const messageRoutes = require('./routes/messageRoute');
const chatbotRoutes = require('./routes/chatbotRoute');
const googleRoutes = require('./routes/googleRoute');

app.use('/api/freelancers', freelancerRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/google', googleRoutes);

app.use((req, res, next) => {
  req.io = io;
  next();
});

const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id);

  socket.on('user:join', (userId) => {
    console.log('👤 User joined:', userId);
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    socket.join(userId);
    io.emit('user:online', userId);
  });

  socket.on('chat:join', (chatId) => {
    socket.join(chatId);
    console.log(`💬 Socket ${socket.id} (user: ${socket.userId}) joined chat ${chatId}`);
  });

  socket.on('chat:leave', (chatId) => {
    socket.leave(chatId);
    console.log(`💬 Socket ${socket.id} left chat ${chatId}`);
  });

  socket.on('typing:start', ({ chatId }) => {
    console.log(`⌨️ User ${socket.userId} typing in chat ${chatId}`);
    socket.to(chatId).emit('user:typing', { chatId, userId: socket.userId });
  });

  socket.on('typing:stop', ({ chatId }) => {
    console.log(`⌨️ User ${socket.userId} stopped typing in chat ${chatId}`);
    socket.to(chatId).emit('user:stop-typing', { chatId, userId: socket.userId });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      io.emit('user:offline', socket.userId);
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Freelancing Platform API",
    version: "1.0.0",
    endpoints: {
      freelancers: "/api/freelancers",
      companies: "/api/companies",
      jobs: "/api/jobs",
      applications: "/api/applications",
      chats: "/api/chats",
      messages: "/api/messages",
      chatbot: "/api/chatbot"
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🤖 AI Chatbot ready`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = { app, io };
