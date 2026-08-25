import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from './config/db.js'
import router from "./routes/routeRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import reviewRouter from './routes/reviewRoutes.js'
import authRouter from './routes/authRoutes.js'

const app = express();

// middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());




connectDB();

// route
app.use("/api/routes", router);
app.use("/api/reviews", reviewRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);


app.get("/", (req, res) => {
  res.json({
    message: "VinBus API is running 🚍",
  });
});

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});