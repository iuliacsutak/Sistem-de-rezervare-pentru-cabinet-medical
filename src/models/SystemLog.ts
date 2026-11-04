import mongoose, { Schema, Model } from "mongoose";

export interface ISystemLog {
  _id: string;
  dataOra: Date;
  nivel: "INFO" | "WARN" | "ERROR" | "AUTH" | "PROGRAMARE" | "ADMIN" | "HTTP";
  metoda?: string;
  ruta: string;
  mesaj: string;
  utilizatorEmail?: string;
  utilizatorRol?: string;
  ip?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detalii?: any;
  createdAt: Date;
}

const SystemLogSchema = new Schema<ISystemLog>(
  {
    dataOra: {
      type: Date,
      default: Date.now,
      index: true,
    },
    nivel: {
      type: String,
      enum: ["INFO", "WARN", "ERROR", "AUTH", "PROGRAMARE", "ADMIN", "HTTP"],
      default: "INFO",
      required: true,
      index: true,
    },
    metoda: {
      type: String,
      default: "GET",
    },
    ruta: {
      type: String,
      required: true,
      index: true,
    },
    mesaj: {
      type: String,
      required: true,
    },
    utilizatorEmail: {
      type: String,
      default: "Anonim",
    },
    utilizatorRol: {
      type: String,
      default: "VIZITATOR",
    },
    ip: {
      type: String,
      default: "127.0.0.1",
    },
    detalii: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compiling model in development
const SystemLog: Model<ISystemLog> =
  mongoose.models.SystemLog || mongoose.model<ISystemLog>("SystemLog", SystemLogSchema);

export default SystemLog;
