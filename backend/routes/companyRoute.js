const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const verifyToken = require('../middlewares/verifyToken');

console.log('🔄 Loading company routes...');

// Public routes (no authentication required)
router.post('/register', companyController.registerCompany);
router.post('/login', companyController.loginCompany);

// Protected routes (require authentication)
router.get('/profile', verifyToken, companyController.getCompanyProfile);
router.put('/update', verifyToken, companyController.updateCompanyProfile);

// FIXED: Add logo upload route
router.put('/upload/logo',
  verifyToken,
  companyController.upload.single('logo'),
  companyController.uploadLogo
);

// Public routes for browsing
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

console.log('✅ Company routes loaded successfully');
console.log('📋 Available routes:');
console.log('   - POST /api/companies/register');
console.log('   - POST /api/companies/login');
console.log('   - GET  /api/companies/profile');
console.log('   - PUT  /api/companies/update');
console.log('   - PUT  /api/companies/upload/logo');
console.log('   - GET  /api/companies/');
console.log('   - GET  /api/companies/:id');

module.exports = router;
