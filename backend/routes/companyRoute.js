const express = require("express");
const { registerCompany, loginCompany, getCompanyById, updateCompanyProfile, uploadCompanyLogo, getAllCompanies} = require("../controllers/companyController");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post("/register", registerCompany);
router.post("/login", loginCompany);


router.put("/update", verifyToken, updateCompanyProfile);
router.put("/upload/logo", verifyToken, upload.single("logo"), uploadCompanyLogo);


router.get("/", getAllCompanies);
router.get("/profile", verifyToken, getCompanyById); 




module.exports = router;
