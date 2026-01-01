import { asyncHandler, sendResponse, apiError } from "../utils/apiResponse.js";
import * as db from "../db/helpers.js";

export const addMessage = asyncHandler(async (req, res) => {
  const { message, from, to, type } = req.body;

  if (!message || !from || !to) {
    return apiError(res, "Missing required fields: message, from, to", 400);
  }
  const isOnline = onlineUsers.has(to);
  const inserted = await db.insertMessage({
    senderId: from,
    receiverId: to,
    type: type || "text",
    message,
    messageStatus: isOnline ? "delivered" : "sent",
  });

  return sendResponse(res, 201, "Message created", { message: inserted });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { from, to } = req.params;
  if (!from || !to) return apiError(res, 'Missing required params: from, to', 400);

  const limit = parseInt(req.query.limit, 10) || 100;
  const offset = parseInt(req.query.offset, 10) || 0;

  try {
    const messages = await db.getMessagesBetweenUsers(parseInt(from, 10), parseInt(to, 10), limit, offset);
    // mark messages as read where receiver is the current user (`from`) and status isn't 'read'
    const toMark = messages.filter(m => {
      const receiver = m.receiverId ?? m.receiverid;
      const status = m.messageStatus ?? m.messagestatus;
      return receiver === parseInt(from, 10) && status !== 'read';
    });
    const idsToMark = toMark.map(m => m.id ?? m.id);
    if (idsToMark.length) {
      await Promise.all(idsToMark.map(id => db.updateMessageStatus(id, 'read')));
      // update local messages array status for response consistency
      messages.forEach(m => {
        if (idsToMark.includes(m.id)) {
          if ('messageStatus' in m) m.messageStatus = 'read';
          if ('messagestatus' in m) m.messagestatus = 'read';
        }
      });
    }

    return sendResponse(res, 200, 'Messages fetched', { messages });
  } catch (err) {
    return apiError(res, 'Failed to fetch messages', 500);
  }
});

export default { addMessage, getMessages };
