import cloudinary from "cloudinary";
import fs from "fs";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImageToCloudinary = async (imagePath) => {
  if (!imagePath) return null;
  try {
    const uploadedImageResponse = await cloudinary.v2.uploader.upload(
      imagePath,
      {
        folder: process.env.CLOUDINARY_ASSETS_FOLDER
      }
    );
    fs.unlinkSync(imagePath);
    return uploadedImageResponse;
  } catch (error) {
    fs.unlinkSync(imagePath);
    return null;
  }
};

export const deleteImageFromCloudinary = async (imageURL) => {
  if (!imageURL) return null;

  let publicId = imageURL?.split("/")?.pop()?.split(".")[0];
  publicId = `${process.env.CLOUDINARY_ASSETS_FOLDER}/${publicId}`;

  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);

    if (result.result !== "ok") {
      throw new Error(`Failed to delete old image: ${result.result}`);
    }

    return result;
  } catch (error) {
    throw error;
  }
};
