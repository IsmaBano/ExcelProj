const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  profileImage: { type: String, default: '' },
  isBlocked: { type: Boolean, default: false },
  lastSeen: { type: Date, default: null },
}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);
