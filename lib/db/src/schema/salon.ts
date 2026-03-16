import { pgTable, text, serial, integer, decimal, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  membershipType: text("membership_type"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  totalVisits: integer("total_visits").notNull().default(0),
  totalSpend: decimal("total_spend", { precision: 10, scale: 2 }).notNull().default("0"),
  lastVisit: timestamp("last_visit"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({ id: true, createdAt: true, totalVisits: true, totalSpend: true, loyaltyPoints: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true, createdAt: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(5),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  supplier: text("supplier"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  commissionPercent: decimal("commission_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  phone: text("phone"),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  workingHours: text("working_hours"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStaffSchema = createInsertSchema(staffTable).omit({ id: true, createdAt: true });
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staffTable.$inferSelect;

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  staffId: integer("staff_id").notNull().references(() => staffTable.id),
  serviceId: integer("service_id").notNull().references(() => servicesTable.id),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;

export const billsTable = pgTable("bills", {
  id: serial("id").primaryKey(),
  billNumber: text("bill_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customersTable.id),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  couponCode: text("coupon_code"),
  loyaltyPointsUsed: integer("loyalty_points_used").notNull().default(0),
  status: text("status").notNull().default("paid"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const billItemsTable = pgTable("bill_items", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull().references(() => billsTable.id),
  type: text("type").notNull(),
  itemId: integer("item_id").notNull(),
  name: text("name").notNull(),
  staffId: integer("staff_id").references(() => staffTable.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  discount: decimal("discount", { precision: 5, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const membershipsTable = pgTable("memberships", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  benefits: text("benefits").notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const expensesTable = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
