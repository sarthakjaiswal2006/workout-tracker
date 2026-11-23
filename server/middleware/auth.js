import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

/**
 * requireAuth: Verifies the JWT access token from the Authorization header.
 * Attaches req.user = { id: userId } on success.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing or invalid Authorization header.",
      });
    }

    const token = authHeader.split(" ")[1]?.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing token.",
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, ACCESS_SECRET);
    } catch (err) {
      const isExpired = err.name === "TokenExpiredError";
      return res.status(401).json({
        success: false,
        error: isExpired ? "Token expired. Please refresh." : "Invalid token.",
      });
    }

    if (payload.type !== "access") {
      return res.status(401).json({
        success: false,
        error: "Invalid token type.",
      });
    }

    req.user = { id: payload.sub };
    next();
  } catch (error) {
    console.error("[Auth Middleware Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during authentication.",
    });
  }
}
