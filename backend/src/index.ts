import "dotenv/config";
import express from "express";
import cors from "cors";
import { guestsRouter } from "./routes/guests.js";
import { recoveryRouter } from "./routes/recovery.js";
import { staffRouter } from "./routes/staff.js";
import { orchestrationRouter } from "./routes/orchestration.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", property: "Rosewood Sand Hill" });
});

app.use("/api/guests", guestsRouter);
app.use("/api/recovery", recoveryRouter);
app.use("/api/staff", staffRouter);
app.use("/api/orchestration", orchestrationRouter);

app.listen(port, () => {
  console.log(`Rosewood Intelligence API listening on :${port}`);
});
