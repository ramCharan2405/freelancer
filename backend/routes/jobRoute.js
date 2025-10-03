const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const verifyToken = require('../middlewares/verifyToken');


router.get('/all', jobController.getAllJobs);


router.get('/company/my-jobs', verifyToken, jobController.getJobsByCompany);


router.post('/create', verifyToken, jobController.createJob);
router.put('/:id', verifyToken, jobController.updateJob);
router.delete('/:id', verifyToken, jobController.deleteJob);

router.get('/:id', jobController.getJobById);



module.exports = router;