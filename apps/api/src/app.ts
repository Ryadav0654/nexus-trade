import express, { type Express, type Request, type Response } from "express";
import { prisma } from "@repo/database";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import appRouter from "./routes/index.js";
import { globalErrorHandler } from "./middleware/error-middleware.js";
import { requireAuth } from "./middleware/auth-middleware.js";
import { z } from "@repo/shared-types";
import { sendValidationError } from "./utils/validation.js";

const app: Express = express();

app.use(helmet()); // add security headers
app.use(express.json());
app.use(cors());
app.use(cookieParser()); // parse cookies

// --- In-memory state ---
const USERS = [];
const STOCKS = [
  { id: 1, title: "AXIS BANK", symbol: "AXIS" },
  { id: 2, title: "HDFC BANK", symbol: "HDFC" },
  { id: 3, title: "TATA Steel", symbol: "TATA" },
];
const ORDERS = [];
const FILLS = [];
export const BALANCES: any = {}; // { userId: { INR: {available, locked}, AXIS: {available, locked}, ... } }
const ORDERBOOK = {
  AXIS: { bids: {}, asks: {} },
  HDFC: { bids: {}, asks: {} },
  TATA: { bids: {}, asks: {} },
};

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello from nexus trade API!");
});

app.use("/api", appRouter);

// --- Auth ---
// app.post("/signup", (req, res) => {
//   // const { username, password } = req.body;
//   // 1. check username not taken
//   // 2. hash password (bcrypt/argon2)
//   // 3. push to USERS
//   // 4. init BALANCES[userId] with INR: { available: 0, locked: 0 }
// });

// app.post("/login", (req, res) => {
//   // 1. find user by username
//   // 2. compare hashed password
//   // 3. return JWT / session token
// });

const orderSchema = z.object({
  side: z.enum(["BUY", "SELL"]),
  type: z.enum(["LIMIT", "MARKET"]),
  symbol: z.string(),
  price: z.number().optional(),
  qty: z.number().min(1, "Quantity must be at least 1"),
});

type Order = z.infer<typeof orderSchema>;
// --- Orders ---
app.post("/order", requireAuth, (req, res) => {
  // body: { userId, side: "BUY"|"SELL", type: "LIMIT"|"MARKET", symbol, price?, qty }
  const userId = req.userId!;
  const { data, error, success } = orderSchema.safeParse(req.body);

  // 1. validate input + stock exists
  if (!success) {
    return sendValidationError(res, error);
  }

  const { side, type, symbol, price, qty } = data;
  const symbolId = STOCKS.find((s) => s.symbol === symbol)?.id;

  if (!symbolId) {
    return res.status(400).json({
      success: false,
      message: "Invalid stock symbol",
    });
  }
  // 2. check + lock balance (INR for BUY, stock for SELL)
  // 3. run matching engine against opposite side of ORDERBOOK
  // 4. write fills to FILLS, update filledQty + status on ORDERS
  // 5. if leftover qty and LIMIT, rest on book; if MARKET, cancel remainder
  // 6. settle balances on each fill (move locked -> other asset's available)
});

app.delete("/order/:orderId", (req, res) => {
  // 1. find order, check ownership
  // 2. remove from ORDERBOOK price level
  // 3. unlock remaining reserved balance
  // 4. mark status = CANCELLED
});

app.get("/orders", (req, res) => {
  // query: ?status=OPEN  (or all)
  // return current user's orders
});

// --- Market data ---
app.get("/orderbook/:symbol", (req, res) => {
  // return aggregated depth — totalQty per price level for bids and asks
  // (don't expose individual userIds to other users)
});

app.get("/fills/:symbol", (req, res) => {
  // recent trades for this stock — the "tape"
});

app.get("/stocks", (req, res) => {
  return res.status(200).json({ success: true, data: STOCKS });
});

// --- User data ---
app.get("/balance", requireAuth, (req: Request, res: Response) => {
  const userId = req.userId!;
  return res.json(BALANCES[userId]);
});

app.get("/health", async (_req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log("[Result]: ", result);
    res.status(200).json({ success: true, message: "OK" });
  } catch (error) {
    console.error("[Error]: ", error);
    res.sendStatus(500);
  }
});

app.use(globalErrorHandler);

export default app;
