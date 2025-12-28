import pool from "../db/index.js";
import { asyncHandler, sendResponse, apiError } from "../utils/apiResponse.js";

export const checkUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);

  return sendResponse(res, 200, "User check successfull", { exists: result.rowCount > 0, ...result.rows[0] });
});

export const onBoardUser = asyncHandler(async (req, res) => {
  const { email, name, about, profileImage } = req.body;
  if (!email || !name || !profileImage) {
    return apiError(res, "Email, name, and profile picture are required", 400);
  }

  const result = await pool.query(
    "INSERT INTO users (email, name, about, profileImage) VALUES ($1, $2, $3, $4) RETURNING id, email, name, about, profileImage, created_at",
    [email, name, about, profileImage]
  );

  return sendResponse(res, 201, "User created successfully", { user: result.rows[0] });
});