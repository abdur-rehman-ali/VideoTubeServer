import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  profileImage: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  watchHistory: [{
    type: Schema.Types.ObjectId,
    ref: "Video"
  }]
}, {
  timestamps: true
})

export const User = mongoose.model("User", userSchema)
