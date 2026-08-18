import express from "express";
import { createRoute, 
        getRoutes, 
        getRouteById, 
        updateRoute,
        deleteRoute
    } from "../controllers/routeController.js";

const router = express.Router();

router.post("/", createRoute);
router.get("/", getRoutes);
router.get("/:id", getRouteById);
router.put("/:id", updateRoute);
router.delete("/:id", deleteRoute);

export default router;