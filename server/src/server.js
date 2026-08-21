import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import connectDB from './config/db.js'
import router from "./routes/routeRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import reviewRouter from './routes/reviewRoutes.js'


dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

connectDB();

// route
app.use("/api/routes", router);
app.use("/api/routes", reviewRouter);

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