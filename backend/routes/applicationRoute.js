const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const verifyToken = require('../middlewares/verifyToken');



router.post('/apply', verifyToken, applicationController.applyForJob);
router.get('/freelancer', verifyToken, applicationController.getFreelancerApplications);
router.get('/company', verifyToken, applicationController.getCompanyApplications); // ADD THIS
router.get('/job/:jobId', verifyToken, applicationController.getJobApplications);
router.put('/:id/status', verifyToken, applicationController.updateApplicationStatus);
router.delete('/:id', verifyToken, applicationController.withdrawApplication);
router.get('/:id', verifyToken, applicationController.getApplicationById);

router.post('/:id/assignment/send', verifyToken, applicationController.sendAssignment);
router.put('/:id/assignment/submit', verifyToken, applicationController.submitAssignment);
router.put('/:id/assignment/review', verifyToken, applicationController.reviewAssignment);
router.post('/:id/interview/schedule', verifyToken, applicationController.scheduleInterview);
router.put('/:id/interview/complete', verifyToken, applicationController.completeInterview);



module.exports = router;