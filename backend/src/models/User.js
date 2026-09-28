const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    referralCode: { type: String, unique: true },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
