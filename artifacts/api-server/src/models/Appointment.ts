import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAppointment extends Document {
  customerId?: Types.ObjectId;
  staffId: Types.ObjectId;
  serviceId: Types.ObjectId;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes?: string;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
  staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  status: { type: String, default: "scheduled", enum: ["scheduled", "confirmed", "in-progress", "completed", "cancelled"] },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);
