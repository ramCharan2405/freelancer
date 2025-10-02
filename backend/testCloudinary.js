require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the connection
cloudinary.api.ping()
  .then(res => {
    console.log("✅ Cloudinary Connected Successfully:", res);
  })
  .catch(err => {
    console.error("❌ Cloudinary Error:", err.message);
  });
