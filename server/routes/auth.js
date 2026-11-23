import express from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  getMe,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/signup  — register a new user
router.post("/signup", signup);

// POST /api/auth/login   — login with email + password
router.post("/login", login);

// POST /api/auth/refresh — get a new access token using refresh token
router.post("/refresh", refreshToken);

// POST /api/auth/logout  — invalidate refresh token (client-side clears access token)
router.post("/logout", requireAuth, logout);

// GET  /api/auth/me      — get current user info
router.get("/me", requireAuth, getMe);

export default router;
