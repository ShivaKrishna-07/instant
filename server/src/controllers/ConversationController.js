import { asyncHandler, sendResponse, apiError } from '../utils/apiResponse.js';
import * as db from '../db/helpers.js';

export const getConversations = asyncHandler(async (req, res) => {
  const decoded = req.user;
  if (!decoded || !decoded.email) return apiError(res, 'Unauthorized', 401);

  const user = await db.getUserByEmail(decoded.email);
  if (!user) return apiError(res, 'User not found', 404);

  const conversations = await db.getConversationsForUser(user.id);
  return sendResponse(res, 200, 'Conversations fetched', { conversations });
});

export default { getConversations };