import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const orchestrationRouter = Router();

orchestrationRouter.get("/:guestId", async (req, res) => {
  const events = await prisma.orchestrationEvent.findMany({
    where: { guestId: req.params.guestId },
    orderBy: { createdAt: "asc" },
  });

  res.json(events);
});

orchestrationRouter.get("/", async (_req, res) => {
  const events = await prisma.orchestrationEvent.findMany({
    include: {
      guest: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(events);
});
