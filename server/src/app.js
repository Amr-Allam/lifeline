import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ data: { status: "ok" } });
});

app.use(notFound);
app.use(errorHandler);

export default app;
