const { Schema, model } = require("mongoose");

const submissionSchema = new Schema(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    content: String,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ competitionId: 1, userId: 1 });

module.exports = model("Submission", submissionSchema);
