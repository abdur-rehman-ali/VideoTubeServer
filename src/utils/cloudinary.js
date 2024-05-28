import cloudinary from "cloudinary";
import fs from "fs";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadFileToCloudinary = async (filePath) => {
  if (!filePath) return null;
  try {
    const uploadedImageResponse = await cloudinary.v2.uploader.upload(
      filePath,
      {
        folder: process.env.CLOUDINARY_ASSETS_FOLDER,
        resource_type: "auto"
      }
    );
    fs.unlinkSync(filePath);
    return uploadedImageResponse;
  } catch (error) {
    fs.unlinkSync(filePath);
    return null;
  }
};

export const deleteFileFromCloudinary = async (fileURL) => {
  if (!fileURL) return null;

  let publicId = fileURL?.split("/")?.pop()?.split(".")[0];
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
