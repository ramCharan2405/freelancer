const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const verifyToken = require('../middlewares/verifyToken');

console.log('🔍 Job Controller Functions:', Object.keys(jobController));

// Public routes FIRST
router.get('/all', jobController.getAllJobs);

// Company specific routes BEFORE dynamic routes
router.get('/company/my-jobs', verifyToken, jobController.getJobsByCompany);

// Protected routes (require authentication)
router.post('/create', verifyToken, jobController.createJob);
router.put('/:id', verifyToken, jobController.updateJob);
router.delete('/:id', verifyToken, jobController.deleteJob);

// Dynamic routes LAST (this should be at the end)
router.get('/:id', jobController.getJobById);

console.log('✅ Job routes loaded successfully');

module.exports = router;