import { User } from "../models/user.model.js"

export const registerUser = async (req, res) => {
  try {
    const { userName, email, password, firstName, lastName } = req.body
    const { profileImage, coverImage } = req.files

    const user = await User.findOne({ email })

    if (user) {
      return res.status(201).json({message: "User with this email already exists"})
    }

    await User.create({
      userName,
      email,
      password,
      firstName,
      lastName,
      profileImage: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
    })
    res.status(200).json({ userName, email, password, firstName, lastName, profileImage: profileImage[0].path, converImage: coverImage[0].path })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}
