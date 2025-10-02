const express = require('express');
const router = express.Router();
const freelancerController = require('../controllers/freelancerController');
const verifyToken = require('../middlewares/verifyToken');

console.log('🔄 Loading freelancer routes...');

// Public routes - NO AUTH REQUIRED
router.post('/register', freelancerController.registerFreelancer);
router.post('/login', freelancerController.loginFreelancer); // Add this line

// Protected routes (require authentication) - PLACE SPECIFIC ROUTES FIRST
router.get('/profile', verifyToken, freelancerController.getFreelancerProfile);
router.put('/update', verifyToken, freelancerController.updateFreelancerProfile);

// Resume routes - MUST BE BEFORE /:id route
router.put('/upload/resume',
  verifyToken,
  freelancerController.upload.single('resume'),
  freelancerController.uploadResume
);

router.delete('/upload/resume',
  verifyToken,
  freelancerController.deleteResume
);

router.get('/download/resume',
  verifyToken,
  freelancerController.downloadResume
);

router.get('/resume/info',
  verifyToken,
  freelancerController.getResumeInfo
);

// File upload routes
router.put('/upload/profile-picture',
  verifyToken,
  freelancerController.upload.single('profilePicture'),
  freelancerController.uploadProfilePicture
);

// Public routes - PLACE DYNAMIC ROUTES LAST
router.get('/', freelancerController.getAllFreelancers);
router.get('/:id', freelancerController.getFreelancerById);

console.log('✅ Freelancer routes loaded successfully');
console.log('📋 Available routes:');
console.log('   - POST /api/freelancers/register');
console.log('   - POST /api/freelancers/login');          // Add this line
console.log('   - GET  /api/freelancers/profile');
console.log('   - PUT  /api/freelancers/update');
console.log('   - PUT  /api/freelancers/upload/resume');
console.log('   - DELETE /api/freelancers/upload/resume');
console.log('   - GET  /api/freelancers/download/resume');
console.log('   - GET  /api/freelancers/resume/info');
console.log('   - PUT  /api/freelancers/upload/profile-picture');
console.log('   - GET  /api/freelancers/');
console.log('   - GET  /api/freelancers/:id');

module.exports = router;
