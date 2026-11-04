import mongoose, { Schema, Model } from "mongoose";
import { ISpecialization } from "@/lib/types";

const SpecializationSchema = new Schema<ISpecialization>(
  {
    denumire: {
      type: String,
      required: [true, "Denumirea specializării este obligatorie"],
      unique: true,
      trim: true,
    },
    descriere: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "Stethoscope",
    },
  },
  {
    timestamps: true,
  }
);

const Specialization: Model<ISpecialization> =
  mongoose.models.Specialization || mongoose.model<ISpecialization>("Specialization", SpecializationSchema);

export default Specialization;

