import { Router } from "express";
import healthRouter from "./health";
import customersRouter from "./customers";
import servicesRouter from "./services";
import productsRouter from "./products";
import staffRouter from "./staff";
import appointmentsRouter from "./appointments";
import billsRouter from "./bills";
import membershipsRouter from "./memberships";
import expensesRouter from "./expenses";
import reportsRouter from "./reports";

const router = Router();

router.use(healthRouter);
router.use("/customers", customersRouter);
router.use("/services", servicesRouter);
router.use("/products", productsRouter);
router.use("/staff", staffRouter);
router.use("/appointments", appointmentsRouter);
router.use("/bills", billsRouter);
router.use("/memberships", membershipsRouter);
router.use("/expenses", expensesRouter);
router.use("/reports", reportsRouter);

export default router;
