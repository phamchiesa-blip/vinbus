import express from 'express'
import { register, login, uploadAvatar } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.put('/avatar', authMiddleware, upload.single("avatar"), uploadAvatar);

export default authRouter;