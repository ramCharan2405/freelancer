require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const freelancerRoute = require("./routes/freelancerRoute");
const companyRoute = require("./routes/companyRoute");
const jobRoute = require("./routes/jobRoute");
const applicationRoute = require("./routes/applicationRoute");

// Register routes - IMPORTANT: Register freelancer routes BEFORE other routes
app.use("/api/freelancers", freelancerRoute);
app.use("/api/companies", companyRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/applications", applicationRoute);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Freelancing Platform API",
    version: "1.0.0",
    endpoints: {
      freelancers: "/api/freelancers",
      companies: "/api/companies",
      jobs: "/api/jobs",
      applications: "/api/applications"
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Global Error Handler:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log('🚀 Server started successfully!');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📋 API documentation available at http://localhost:${PORT}`);
  console.log('📍 Available endpoints:');
  console.log('   - Freelancers: http://localhost:${PORT}/api/freelancers');
  console.log('   - Companies: http://localhost:${PORT}/api/companies');
  console.log('   - Jobs: http://localhost:${PORT}/api/jobs');
  console.log('   - Applications: http://localhost:${PORT}/api/applications');
  console.log('🔥 Ready to accept requests!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});
