import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const recoveryRouter = Router();

recoveryRouter.get("/", async (_req, res) => {
  const incidents = await prisma.serviceIncident.findMany({
    include: {
      guest: {
        select: {
          id: true,
          name: true,
          loyaltyTier: true,
          sentimentScore: true,
        },
      },
    },
    orderBy: [{ resolutionStatus: "asc" }, { createdAt: "desc" }],
  });

  res.json(incidents);
});

recoveryRouter.patch("/:id", async (req, res) => {
  const incident = await prisma.serviceIncident.update({
    where: { id: req.params.id },
    data: {
      resolutionStatus: req.body.resolutionStatus,
      recoveryNotes: req.body.recoveryNotes,
    },
    include: { guest: true },
  });

  res.json(incident);
});
