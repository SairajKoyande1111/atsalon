import { Router } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, customersTable, staffTable, servicesTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { date, staffId, status } = req.query as Record<string, string>;

  const rows = await db.select({
    appointment: appointmentsTable,
    customer: { id: customersTable.id, name: customersTable.name, phone: customersTable.phone },
    staff: { id: staffTable.id, name: staffTable.name },
    service: { id: servicesTable.id, name: servicesTable.name, category: servicesTable.category, duration: servicesTable.duration },
  })
    .from(appointmentsTable)
    .leftJoin(customersTable, eq(appointmentsTable.customerId, customersTable.id))
    .leftJoin(staffTable, eq(appointmentsTable.staffId, staffTable.id))
    .leftJoin(servicesTable, eq(appointmentsTable.serviceId, servicesTable.id))
    .orderBy(desc(appointmentsTable.createdAt));

  let appointments = rows.map(r => ({
    id: r.appointment.id,
    customerId: r.appointment.customerId,
    customerName: r.customer?.name || "Walk-in",
    customerPhone: r.customer?.phone || "",
    staffId: r.appointment.staffId,
    staffName: r.staff?.name || "",
    serviceId: r.appointment.serviceId,
    serviceName: r.service?.name || "",
    serviceCategory: r.service?.category || "",
    appointmentDate: r.appointment.appointmentDate,
    appointmentTime: r.appointment.appointmentTime,
    duration: r.service?.duration || 30,
    status: r.appointment.status,
    notes: r.appointment.notes,
  }));

  if (date) appointments = appointments.filter(a => a.appointmentDate === date);
  if (staffId) appointments = appointments.filter(a => a.staffId === parseInt(staffId));
  if (status) appointments = appointments.filter(a => a.status === status);

  res.json({ appointments });
});

router.post("/", async (req, res) => {
  const { customerId, staffId, serviceId, appointmentDate, appointmentTime, notes } = req.body;
  const [appointment] = await db.insert(appointmentsTable).values({
    customerId, staffId, serviceId, appointmentDate, appointmentTime, notes
  }).returning();

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
  const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, staffId));
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId));

  res.status(201).json({
    id: appointment.id,
    customerId: appointment.customerId,
    customerName: customer?.name || "Walk-in",
    customerPhone: customer?.phone || "",
    staffId: appointment.staffId,
    staffName: staff?.name || "",
    serviceId: appointment.serviceId,
    serviceName: service?.name || "",
    serviceCategory: service?.category || "",
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    duration: service?.duration || 30,
    status: appointment.status,
    notes: appointment.notes,
  });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status, notes } = req.body;
  const [appointment] = await db.update(appointmentsTable).set({ status, notes }).where(eq(appointmentsTable.id, id)).returning();
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, appointment.customerId));
  const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, appointment.staffId));
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, appointment.serviceId));

  res.json({
    id: appointment.id,
    customerId: appointment.customerId,
    customerName: customer?.name || "Walk-in",
    customerPhone: customer?.phone || "",
    staffId: appointment.staffId,
    staffName: staff?.name || "",
    serviceId: appointment.serviceId,
    serviceName: service?.name || "",
    serviceCategory: service?.category || "",
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    duration: service?.duration || 30,
    status: appointment.status,
    notes: appointment.notes,
  });
});

export default router;
