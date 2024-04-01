import { User } from "../models/user.model.js"

export const registerUser = async (req, res) => {
  try {
    const { userName, email, password, firstName, lastName } = req.body
    const user = await User.create({
      userName,
      email,
      password,
      firstName,
      lastName,
      profileImage: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
    })
    res.status(200).json({ userName, email, password, firstName, lastName })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}
