import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/lib/types";

const UserSchema = new Schema<IUser>(
  {
    nume: {
      type: String,
      required: [true, "Numele complet este obligatoriu"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Adresa de email este obligatorie"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    parola: {
      type: String,
      required: [true, "Parola este obligatorie"],
      minlength: 6,
    },
    telefon: {
      type: String,
      default: "",
      trim: true,
    },
    cnp: {
      type: String,
      default: "",
      trim: true,
    },
    rol: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "ADMIN"],
      default: "PATIENT",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

