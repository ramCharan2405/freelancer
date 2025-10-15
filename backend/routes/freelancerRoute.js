const express = require('express');
const router = express.Router();
const freelancerController = require('../controllers/freelancerController');
const verifyToken = require('../middlewares/verifyToken');




router.post('/register', freelancerController.registerFreelancer);
router.post('/login', freelancerController.loginFreelancer); // Add this line


router.get('/profile', verifyToken, freelancerController.getFreelancerProfile);
router.put('/update', verifyToken, freelancerController.updateFreelancerProfile);


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


router.put('/upload/profile-picture',
  verifyToken,
  freelancerController.upload.single('profilePicture'),
  freelancerController.uploadProfilePicture
);


router.get('/', freelancerController.getAllFreelancers);
router.get('/:id', freelancerController.getFreelancerById);
router.get('/resume/:id',
  verifyToken,
  freelancerController.getFreelancerResume
);















module.exports = router;
