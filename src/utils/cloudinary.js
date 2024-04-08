import cloudinary from 'cloudinary'
import fs from 'fs'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImageToCloudinary = async (imagePath) => {
  try {
    const uploadedImage = await cloudinary.v2.uploader.upload(imagePath, {
      folder: 'VideoTube'
    })
    fs.unlinkSync(imagePath)
    return uploadedImage
  } catch (error) {
    fs.unlinkSync(imagePath)
    console.log(error.message);
  }
}