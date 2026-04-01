import { Router } from "express";
import Appointment from "../models/Appointment";
import Customer from "../models/Customer";
import Staff from "../models/Staff";
import Service from "../models/Service";
import { withId, withIds } from "../utils/format";

const router = Router();

async function enrichAppointment(appt: any) {
  const [customer, staff, service] = await Promise.all([
    appt.customerId ? Customer.findById(appt.customerId).lean() : Promise.resolve(null),
    Staff.findById(appt.staffId).lean(),
    Service.findById(appt.serviceId).lean(),
  ]);
  return {
    ...withId(appt),
    customerName: (customer as any)?.name || "Walk-in",
    customerPhone: (customer as any)?.phone || "",
    staffName: (staff as any)?.name || "",
    serviceName: (service as any)?.name || "",
    serviceCategory: (service as any)?.category || "",
    duration: (service as any)?.duration || 30,
  };
}

router.get("/", async (req, res) => {
  try {
    const { date } = req.query as Record<string, string>;
    const filter: any = {};
    if (date) filter.appointmentDate = date;

    const appointments = await Appointment.find(filter).sort({ appointmentTime: 1 }).lean();
    const enriched = await Promise.all(appointments.map(enrichAppointment));
    res.json({ appointments: enriched });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { customerId, staffId, serviceId, appointmentDate, appointmentTime, notes } = req.body;
    const appt = await Appointment.create({
      customerId: customerId || null,
      staffId,
      serviceId,
      appointmentDate,
      appointmentTime,
      notes,
    });
    const enriched = await enrichAppointment(appt.toObject());
    res.status(201).json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, lean: true }
    );
    if (!appt) return res.status(404).json({ error: "Appointment not found" });
    const enriched = await enrichAppointment(appt);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

export default router;
