import express, { type Express, type Request, type Response } from "express";
import { prisma } from "@repo/database";
const app: Express = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from nexus trade API!");
});

app.post("/users", async (req: Request, res: Response) => {
  const { email, name } = req.body;

  const user = await prisma.user.create({
    data: {
      email,
      name,
    },
  });

  return res.json(user);
});
app.get("/users", async (req: Request, res: Response) => {
  const user = await prisma.user.findMany();

  return res.json(user);
});

export default app;
