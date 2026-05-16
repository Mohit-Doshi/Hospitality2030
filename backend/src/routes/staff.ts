import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const staffRouter = Router();

staffRouter.get("/", async (_req, res) => {
  const staff = await prisma.staff.findMany({
    include: {
      affinities: {
        include: {
          guest: {
            select: {
              id: true,
              name: true,
              loyaltyTier: true,
              arrivalEta: true,
            },
          },
        },
        orderBy: { affinityScore: "desc" },
      },
    },
  });

  res.json(staff);
});
