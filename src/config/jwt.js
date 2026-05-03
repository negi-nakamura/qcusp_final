import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_CONFIG = {
  access: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
};

export function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_CONFIG.access.secret, {
    expiresIn: JWT_CONFIG.access.expiresIn,
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_CONFIG.refresh.secret, {
    expiresIn: JWT_CONFIG.refresh.expiresIn,
  });
}

export function generateTokens(payload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_CONFIG.access.secret);
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_CONFIG.refresh.secret);
  } catch {
    return null;
  }
}

export function decodeToken(token) {
  return jwt.decode(token);
}