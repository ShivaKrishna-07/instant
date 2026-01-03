import * as db from "../db/helpers.js";
import { asyncHandler, sendResponse, apiError } from "../utils/apiResponse.js";
import cloudinaryUtils from "../utils/cloudinary.js";
import admin from "../config/firebaseAdmin.js";

export const checkUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return apiError(res, "Email is required", 400);
  }

  const existsRow = await db.userExistsByEmail(email);
  const exists = !!existsRow;

  return sendResponse(res, 200, "User check successful", {
    exists,
    ...(existsRow || {}),
  });
});

export const onBoardUser = asyncHandler(async (req, res) => {
  const { email, name, about, profile_image } = req.body;
  if (!email || !name || !profile_image) {
    return apiError(res, "Email, name, and profile picture are required", 400);
  }

  // profile_image may be a remote URL (from Firebase) or a data URL / local path.
  let storedImage = profile_image;

  try {
    // If image is a client-side public asset (starts with '/'), store as is
    if (typeof profile_image === "string" && profile_image.startsWith("/")) {
      storedImage = profile_image;
    } else if (
      typeof profile_image === "string" &&
      profile_image.startsWith("data:")
    ) {
      // data URL (camera/photo) -> upload buffer
      const matches = profile_image.match(/^data:(.+);base64,(.+)$/);
      if (!matches) throw new Error("Invalid data URL");
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");
      const uploaded = await cloudinaryUtils.uploadFromBuffer(buffer, {
        folder: "instant/users",
      });
      storedImage = uploaded?.secure_url || storedImage;
    } else {
      // For remote URLs (https://...)
      const uploaded = await cloudinaryUtils.uploadFromPath(profile_image, {
        folder: "instant/users",
        overwrite: true,
      });
      storedImage = uploaded?.secure_url || profile_image;
    }
  } catch (err) {
    return apiError(
      res,
      "Failed to upload profile image",
      500,
      err?.message || String(err)
    );
  }

  const inserted = await db.insertUser({ email, name, about, profile_image: storedImage });

  return sendResponse(res, 201, "User created successfully", {
    user: inserted,
    profile_image: storedImage,
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