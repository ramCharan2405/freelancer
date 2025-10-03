const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const verifyToken = require('../middlewares/verifyToken');




router.post('/register', companyController.registerCompany);
router.post('/login', companyController.loginCompany);


router.get('/profile', verifyToken, companyController.getCompanyProfile);
router.put('/update', verifyToken, companyController.updateCompanyProfile);


router.put('/upload/logo',
  verifyToken,
  companyController.upload.single('logo'),
  companyController.uploadLogo
);


router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);











module.exports = router;
