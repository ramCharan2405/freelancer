const express = require("express");
const { registerFreelancer, loginFreelancer , getFreelancer ,updateFreelancer, getAllFreelancers } = require("../controllers/freelancerController");

const router = express.Router();

router.post("/register", registerFreelancer);
router.post("/login", loginFreelancer);
router.get("/getFreelancers", getAllFreelancers)
router.get("/:id", getFreelancer);
router.put("/:id", updateFreelancer);

module.exports = router;
