import { User } from "../models/user.model.js"
import { uploadImageToCloudinary } from "../utils/cloudinary.js"

export const registerUser = async (req, res) => {
  try {
    const { userName, email, password, firstName, lastName } = req.body
    const { profileImage, coverImage } = req.files

    const user = await User.findOne({ email })

    if (user) {
      return res.status(201).json({ message: "User with this email already exists" })
    }

    let uploadedProfileImage = ''
    if (profileImage && profileImage.length > 0 && profileImage[0].path) {
      uploadedProfileImage = await uploadImageToCloudinary(profileImage[0].path);
    }
    let uploadedCoverImage = ''
    if (coverImage && coverImage.length > 0 && coverImage[0].path) {
      uploadedCoverImage = await uploadImageToCloudinary(coverImage[0].path);
    }

    await User.create({
      userName,
      email,
      password,
      firstName,
      lastName,
      profileImage: uploadedProfileImage?.url,
      coverImage: uploadedCoverImage?.url
    })
    res.status(200).json({ userName, email, password, firstName, lastName, profileImage: uploadedProfileImage?.url, converImage: uploadedCoverImage?.url })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}
