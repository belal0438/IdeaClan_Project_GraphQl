const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(imageFile) {
  try {
    if (!imageFile) return null;
    const result = await cloudinary.uploader.upload(imageFile, {
      folder: "books",
    });
    return result.secure_url;
  } catch (error) {
    throw new Error("Failed to upload image to Cloudinary");
  }
}

module.exports = { uploadImage };
