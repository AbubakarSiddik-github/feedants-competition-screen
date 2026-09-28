const { Schema, model } = require("mongoose");

const competitionSchema = new Schema(
  {
    title: String,
    category: [String],
    type: { type: String, enum: ["single-win", "multi-win"] },
    certificateForWinners: Boolean,
    prizePool: Number,
    entryFee: Number,
    totalSpots: Number,
    spotsBooked: { type: Number, default: 0 },
    registrationDeadline: Date,
    submissionStart: Date,
    submissionEnd: Date,
    resultDate: Date,
    judge: {
      name: String,
      title: String,
      experience: String,
      photoUrl: String,
      introVideoUrl: String,
    },
    description: { short: String, full: String },
    judgingParameters: String,
    rulesAndEligibility: String,
    rewards: [{ position: Number, label: String, amount: Number }],
    previousWinners: [
      {
        name: String,
        photoUrl: String,
        position: Number,
        videoUrl: String,
      },
    ],
    disclaimers: [String],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
  },
  { timestamps: true }
);

competitionSchema.index({ registrationDeadline: 1 });
competitionSchema.index({ status: 1 });

module.exports = model("Competition", competitionSchema);
