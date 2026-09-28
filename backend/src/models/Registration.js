const { Schema, model } = require("mongoose");

const registrationSchema = new Schema(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    entryFeePaid: Number,
    paymentId: String,
    referralCodeUsed: String,
  },
  { timestamps: true }
);

// Hard backstop against double registration
registrationSchema.index(
  { competitionId: 1, userId: 1 },
  { unique: true }
);

module.exports = model("Registration", registrationSchema);
