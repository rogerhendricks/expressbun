import express from "express";
import jwt from "jsonwebtoken";
import { setTokens } from "../utils/generateToken.js";
import prisma from "../utils/prisma.js";
import hashToken from "../utils/hashToken.js";
import { refreshTokenLimiter } from "../middleware/rateLimitMiddeware.js";

const router = express.Router();


const cookieOptions = { 
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', // Or 'lax' if that's your intended default for clearing
  path: '/',
  expires: new Date(0) // For clearing
};

router.post('/', refreshTokenLimiter, async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, userAuthToken: true, email: true, name: true },
    });

    // Verify the refresh token against the stored hash
    if (!user || !user.userAuthToken || hashToken(refreshToken) !== user.userAuthToken) {
      // If the token is invalid or not found, clear the cookies
      // Potentially, this could be a stolen token, so invalidate it if it exists
      if (user && user.userAuthToken) {
        await prisma.user.update({
          where: { id: user.id },
          data: { userAuthToken: null }, // Invalidate by clearing
        });
      }
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Issue new tokens
    await setTokens(res, user.id, prisma); // setTokens will handle storing the new hashed refresh token

    // Send only necessary user info, or just a success message, but not sensitive data like the token itself
    res.status(200).json({
      message: 'Tokens refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    // Clear cookies on any error during refresh token processing
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;