export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export interface IUser {
  _id: string;
  nume: string;
  email: string;
  parola?: string;
  telefon?: string;
  cnp?: string;
  rol: UserRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IWorkingHours {
  ziuaSaptamanii: number; // 1 = Luni, 2 = Marți, ..., 5 = Vineri, 6 = Sâmbătă, 0 = Duminică
  activ: boolean;
  oraInceput: string; // "08:00"
  oraSfarsit: string; // "16:00"
  durataConsultMinute: number; // ex: 30
}

export interface ISpecialization {
  _id: string;
  denumire: string;
  descriere?: string;
  icon?: string;
  createdAt?: Date | string;
}

export interface IMedicalService {
  _id: string;
  specializareId: string | ISpecialization;
  denumire: string;
  descriere?: string;
  pret: number;
  durataMinute: number;
}

export interface IDoctor {
  _id: string;
  userId: string | IUser;
  specializareId: string | ISpecialization;
  titlu: string; // ex: "Medic Primar", "Medic Specialist"
  descriere?: string;
  numarCabinet?: string;
  programLucru: IWorkingHours[];
  pretConsultDefault?: number;
}

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface IAppointment {
  _id: string;
  pacientId: string | IUser;
  medicId: string | IDoctor;
  serviciuId: string | IMedicalService;
  dataOra: Date | string;
  durataMinute: number;
  status: AppointmentStatus;
  motiv?: string;
  diagnosticSauObservatii?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface JWTPayloadData {
  userId: string;
  email: string;
  nume: string;
  rol: UserRole;
  doctorProfileId?: string;
}

