import mongoose, { Schema, Model } from "mongoose";
import { IAppointment } from "@/lib/types";

const AppointmentSchema = new Schema<IAppointment>(
  {
    pacientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pacientul este obligatoriu"],
    },
    medicId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Medicul este obligatoriu"],
    },
    serviciuId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Serviciul medical este obligatoriu"],
    },
    dataOra: {
      type: Date,
      required: [true, "Data și ora sunt obligatorii"],
    },
    durataMinute: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
      required: true,
    },
    motiv: {
      type: String,
      default: "",
    },
    diagnosticSauObservatii: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly look up doctor appointments on specific timeframes
AppointmentSchema.index({ medicId: 1, dataOra: 1 });
AppointmentSchema.index({ pacientId: 1, dataOra: 1 });

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;

