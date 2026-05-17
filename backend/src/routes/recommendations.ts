import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const recommendationsRouter = Router();

recommendationsRouter.patch("/:id/resolve", async (req, res) => {
  const existing = await prisma.recommendation.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    res.status(404).json({ error: "Recommendation not found" });
    return;
  }

  const recommendation = await prisma.recommendation.update({
    where: { id: req.params.id },
    data: { status: "resolved" },
  });

  res.json(recommendation);
});

recommendationsRouter.patch("/:id/reopen", async (req, res) => {
  const existing = await prisma.recommendation.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    res.status(404).json({ error: "Recommendation not found" });
    return;
  }

  const recommendation = await prisma.recommendation.update({
    where: { id: req.params.id },
    data: { status: "pending" },
  });

  res.json(recommendation);
});
