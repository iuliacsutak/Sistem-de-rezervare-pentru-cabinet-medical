import mongoose, { Schema, models, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mesaj: { type: String, required: true },
    citita: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Notification || model("Notification", NotificationSchema);