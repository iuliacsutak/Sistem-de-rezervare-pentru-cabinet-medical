import mongoose, { Schema, Model } from "mongoose";
import { IMedicalService } from "@/lib/types";

const ServiceSchema = new Schema<IMedicalService>(
  {
    specializareId: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
      required: [true, "Specializarea asociată este obligatorie"],
    },
    denumire: {
      type: String,
      required: [true, "Denumirea serviciului este obligatorie"],
      trim: true,
    },
    descriere: {
      type: String,
      default: "",
    },
    pret: {
      type: Number,
      required: [true, "Prețul este obligatoriu"],
      min: 0,
    },
    durataMinute: {
      type: Number,
      default: 30,
      min: 10,
    },
  },
  {
    timestamps: true,
  }
);

const Service: Model<IMedicalService> =
  mongoose.models.Service || mongoose.model<IMedicalService>("Service", ServiceSchema);

export default Service;

