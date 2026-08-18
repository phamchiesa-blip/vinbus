import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from './config/db.js'
import router from "./routes/routeRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

connectDB();

// route
app.use("/api/routes", router);
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