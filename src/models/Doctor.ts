import mongoose, { Schema, Model } from "mongoose";
import { IDoctor, IWorkingHours } from "@/lib/types";

const WorkingHoursSchema = new Schema<IWorkingHours>(
  {
    ziuaSaptamanii: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    activ: {
      type: Boolean,
      default: true,
    },
    oraInceput: {
      type: String,
      default: "09:00",
    },
    oraSfarsit: {
      type: String,
      default: "17:00",
    },
    durataConsultMinute: {
      type: Number,
      default: 30,
    },
  },
  { _id: false }
);

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Utilizatorul asociat medicului este obligatoriu"],
      unique: true,
    },
    specializareId: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
      required: [true, "Specializarea este obligatorie"],
    },
    titlu: {
      type: String,
      default: "Medic Specialist",
      trim: true,
    },
    descriere: {
      type: String,
      default: "",
    },
    numarCabinet: {
      type: String,
      default: "Cabinet 1",
    },
    pretConsultDefault: {
      type: Number,
      default: 150,
    },
    programLucru: {
      type: [WorkingHoursSchema],
      default: () => [
        { ziuaSaptamanii: 1, activ: true, oraInceput: "09:00", oraSfarsit: "17:00", durataConsultMinute: 30 },
        { ziuaSaptamanii: 2, activ: true, oraInceput: "09:00", oraSfarsit: "17:00", durataConsultMinute: 30 },
        { ziuaSaptamanii: 3, activ: true, oraInceput: "09:00", oraSfarsit: "17:00", durataConsultMinute: 30 },
        { ziuaSaptamanii: 4, activ: true, oraInceput: "09:00", oraSfarsit: "17:00", durataConsultMinute: 30 },
        { ziuaSaptamanii: 5, activ: true, oraInceput: "09:00", oraSfarsit: "17:00", durataConsultMinute: 30 },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Doctor: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;

