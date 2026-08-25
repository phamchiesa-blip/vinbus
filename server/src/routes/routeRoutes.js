import express from "express";
import { createRoute, 
        getRoutes, 
        getRouteById, 
        updateRoute,
        deleteRoute
    } from "../controllers/routeController.js";
import authMiddleware from '../middleware/authMiddleware.js'
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.post("/", authMiddleware, authorize("admin"), createRoute);
router.get("/", getRoutes);
router.get("/:id", getRouteById);
router.put("/:id", authMiddleware, authorize("admin"), updateRoute);
router.delete("/:id", authMiddleware, authorize("admin"), deleteRoute);

export default router;