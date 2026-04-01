import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { connectDB } from "./db/mongodb";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB().catch(console.error);

app.use("/api", router);

export default app;
