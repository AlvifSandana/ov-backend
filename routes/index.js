import express from "express";
import { Register, Login, Logout } from "../controllers/UserController.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

router.get('/token', refreshToken);
router.post('/users', Register);
router.post('/login', Login);
router.delete('/logout', Logout);

export default router;
