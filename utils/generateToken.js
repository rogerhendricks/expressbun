import jwt from "jsonwebtoken";
import hashToken from './hashToken.js';

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" }); // 15 minutes
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" }); // 7 days
};

const setTokens = async (res, userId, prisma) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  const accessExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins in ms
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in ms
  // Save refresh token in the database
  // Store hashed refresh token in DB
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { userAuthToken: hashToken(refreshToken) }, // Changed refreshToken to userAuthToken
    });
  } catch (error) {
    console.error("Error saving refresh token to DB:", error);
    // Handle error appropriately, maybe throw or return an error response
    // For now, just logging
  }
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: accessExpires,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: refreshExpires,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  // res.json({ success: true });
};

export { generateAccessToken, setTokens, generateRefreshToken };