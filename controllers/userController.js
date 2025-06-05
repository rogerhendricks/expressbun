import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { setTokens, generateAccessToken } from '../utils/generateToken.js';

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { username,  password } = req.body;

  if (!password || !username) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const accessExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins
  await setTokens(res, user.id, prisma);

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    accessExpires,
  });
});

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;

  // Input validation
  if (!username || !name || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const userExists = await prisma.user.findFirst({
    where: { 
      OR: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    },
  });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }


  const user = await prisma.user.create({
    data: {
      username: username.toLowerCase(),
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 12),
    },
  });

  if (user) {
    await setTokens(res, user.id, prisma);
    res.status(201).json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Logout user
 * @route   POST /api/users/logout
 * @access  Public
 */
const logoutUser = asyncHandler(async (req, res) => {
  // Clear userAuthToken or hashed refresh token in the database
  // Assuming you have a field for storing the refresh token;
  await prisma.user.update({
    where: { id: req.user.id }, // Assuming req.user is populated or get user ID differently
    data: { userAuthToken: null }, // Or your chosen field for hashed refresh token
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Match setTokens
    expires: new Date(0),
  };

  res.cookie('accessToken', '', cookieOptions);
  res.cookie('refreshToken', '', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile/:id
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = parseInt(req.user.id, 10);

  if (isNaN(userId)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      // Explicitly exclude password
    },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile/:id
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  const { username, name, email, password } = req.body;

  if (isNaN(userId)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }

  // Ensure the logged-in user can only update their own profile
  // This check might be more robust depending on how req.user is populated
  if (req.user.id !== userId) {
    res.status(403);
    throw new Error('You are not authorized to update this profile');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const updateData = {};

  if (name && name.trim() !== user.name) {
    updateData.name = name.trim();
  }

  if (name) {
    updateData.name = name.trim();
  }
  if (email && email.toLowerCase() !== user.email) {
    // Check if email is already taken by another user
    const emailExists = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        NOT: { id: userId },
      },
    });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use by another account');
    }
    updateData.email = email.toLowerCase();
  }


  if (password) {
    updateData.password = bcrypt.hashSync(password, 12);
    // Invalidate refresh token if password is changed
    updateData.userAuthToken = null;
  }

  if (Object.keys(updateData).length === 0) {
    res.status(400);
    throw new Error('No update data provided');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
    },
  });

  res.json(updatedUser);
});

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};