import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function creeazaNotificare(userId: string, mesaj: string) {
  try {
    await connectToDatabase();
    await Notification.create({ userId, mesaj });
  } catch (e) {
    console.error("Notificare eșuată:", e); // nu blocăm rezervarea dacă pică
  }
}