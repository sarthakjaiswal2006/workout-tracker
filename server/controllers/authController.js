import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const SALT_ROUNDS = 12;
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || 7;

// ─── Token helpers ────────────────────────────────────────────────────────────

function generateAccessToken(userId) {
  return jwt.sign({ sub: userId, type: "access" }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: "refresh" }, REFRESH_SECRET, {
    expiresIn: `${REFRESH_EXPIRES_DAYS}d`,
  });
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters.",
      });
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    // Issue tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    console.error("[Signup Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Could not create account. Please try again.",
    });
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    // Issue tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[Login Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Could not log in. Please try again.",
    });
  }
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

export async function refreshToken(req, res) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No refresh token provided.",
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, REFRESH_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired refresh token.",
      });
    }

    if (payload.type !== "refresh") {
      return res.status(401).json({ success: false, error: "Invalid token type." });
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found." });
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, accessToken: newAccessToken, user });
  } catch (error) {
    console.error("[Refresh Error]:", error);
    return res.status(500).json({ success: false, error: "Could not refresh token." });
  }
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

export async function logout(req, res) {
  res.clearCookie("refreshToken");
  return res.json({ success: true, message: "Logged out successfully." });
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error("[GetMe Error]:", error);
    return res.status(500).json({ success: false, error: "Could not fetch user." });
  }
}
