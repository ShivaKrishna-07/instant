import * as db from "../db/helpers.js";
import { asyncHandler, sendResponse, apiError } from "../utils/apiResponse.js";
import cloudinaryUtils from "../utils/cloudinary.js";
import admin from "../config/firebaseAdmin.js";

export const checkUser = asyncHandler(async (req, res) => {
  const { email, token } = req.body;

  // If token provided, verify it and set cookie when user exists
  let decoded = null;
  if (token) {
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (err) {
      // invalid token -> continue to check user but do not set cookie
      decoded = null;
    }
  }

  const existsRow = await db.userExistsByEmail(email);
  const exists = !!existsRow;

  if (exists && decoded) {
    // set httpOnly cookie
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    };
    res.cookie("token", token, cookieOpts);
  }

  return sendResponse(res, 200, "User check successfull", {
    exists,
    ...(existsRow || {}),
  });
});

export const onBoardUser = asyncHandler(async (req, res) => {
  const { email, name, about, profileImage, token } = req.body;
  if (!email || !name || !profileImage) {
    return apiError(res, "Email, name, and profile picture are required", 400);
  }

  // profileImage may be a remote URL (from Firebase) or a data URL / local path.
  // Decide whether to upload to Cloudinary or store the client public asset URL directly.
  let storedImage = profileImage;

  try {
    // If image is a client-side public asset (starts with '/'), store absolute client URL directly
    if (typeof profileImage === "string" && profileImage.startsWith("/")) {
      storedImage = profileImage;
    } else if (
      typeof profileImage === "string" &&
      profileImage.startsWith("data:")
    ) {
      // data URL (camera/photo) -> upload buffer
      const matches = profileImage.match(/^data:(.+);base64,(.+)$/);
      if (!matches) throw new Error("Invalid data URL");
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");
      const uploaded = await cloudinaryUtils.uploadFromBuffer(buffer, {
        folder: "instant/users",
      });
      storedImage = uploaded?.secure_url || storedImage;
    } else {
      // For remote URLs (https://...) or other cases, let Cloudinary fetch or upload remote URL
      const uploaded = await cloudinaryUtils.uploadFromPath(profileImage, {
        folder: "instant/users",
        overwrite: true,
      });
      storedImage = uploaded?.secure_url || profileImage;
    }
  } catch (err) {
    return apiError(
      res,
      "Failed to upload profile image",
      500,
      err?.message || String(err)
    );
  }

  const inserted = await db.insertUser({ email, name, about, profileImage: storedImage });

  // If token provided and valid, set httpOnly cookie for subsequent requests
  if (token) {
    try {
      await admin.auth().verifyIdToken(token);
      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      };
      res.cookie("token", token, cookieOpts);
    } catch (err) {
      // ignore invalid token here; user created but not authenticated server-side
    }
  }

  return sendResponse(res, 201, "User created successfully", {
    user: inserted,
    profileImage: storedImage,
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const decoded = req.user;

  const user = await db.getUserByEmail(decoded.email);
  if (!user) return apiError(res, 'User not found', 404);
  return sendResponse(res, 200, 'User fetched successfully', { user });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await db.getAllUsers();

  // Group users by initial letter
  const usersGroupedByInitialLetter = {};

  users.forEach((user) => {
    if (!user.name) return;

    const initialLetter = user.name.charAt(0).toUpperCase();

    if (!usersGroupedByInitialLetter[initialLetter]) {
      usersGroupedByInitialLetter[initialLetter] = [];
    }

    usersGroupedByInitialLetter[initialLetter].push(user);
  });

  return sendResponse(res, 200, 'Users fetched successfully', { users, usersGroupedByInitialLetter });
});