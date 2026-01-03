import { asyncHandler, sendResponse, apiError } from "../utils/apiResponse.js";
import * as db from "../db/helpers.js";
import { uploadFromBuffer } from "../utils/cloudinary.js";

export const addMessage = asyncHandler(async (req, res) => {
  const { message, from, to, type } = req.body;

  if (!message || !from || !to) {
    return apiError(res, "Missing required fields: message, from, to", 400);
  }
  const isOnline = onlineUsers.has(to);
  const inserted = await db.insertMessage({
    sender_id: from,
    receiver_id: to,
    type: type || "text",
    message,
    message_status: isOnline ? "delivered" : "sent",
  });

  return sendResponse(res, 201, "Message created", { message: inserted });
});

export const addImageMessage = asyncHandler(async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    return apiError(res, "Missing required fields: from, to", 400);
  }

  if (!req.file) {
    return apiError(res, "No image file provided", 400);
  }

  try {
    // Upload image to Cloudinary
    const uploadResult = await uploadFromBuffer(req.file.buffer, {
      folder: 'instant-chat/images',
      resource_type: 'image',
    });

    const isOnline = onlineUsers.has(parseInt(to));
    const inserted = await db.insertMessage({
      sender_id: parseInt(from),
      receiver_id: parseInt(to),
      type: "image",
      message: uploadResult.secure_url,
      message_status: isOnline ? "delivered" : "sent",
    });

    return sendResponse(res, 201, "Image message created", { message: inserted });
  } catch (error) {
    console.error("Image upload error:", error);
    return apiError(res, "Failed to upload image", 500);
  }
});

export const addAudioMessage = asyncHandler(async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    return apiError(res, "Missing required fields: from, to", 400);
  }

  if (!req.file) {
    return apiError(res, "No audio file provided", 400);
  }

  try {
    // Upload audio to Cloudinary
    const uploadResult = await uploadFromBuffer(req.file.buffer, {
      folder: 'instant-chat/audio',
      resource_type: 'video', // Cloudinary uses 'video' for audio files
      format: 'mp3',
    });

    const isOnline = onlineUsers.has(parseInt(to));
    const inserted = await db.insertMessage({
      sender_id: parseInt(from),
      receiver_id: parseInt(to),
      type: "audio",
      message: uploadResult.secure_url,
      message_status: isOnline ? "delivered" : "sent",
    });

    return sendResponse(res, 201, "Audio message created", { message: inserted });
  } catch (error) {
    console.error("Audio upload error:", error);
    return apiError(res, "Failed to upload audio", 500);
  }
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
      const receiver = m.receiver_id;
      const status = m.message_status;
      return receiver === parseInt(from, 10) && status !== 'read';
    });
    const idsToMark = toMark.map(m => m.id);
    if (idsToMark.length) {
      await Promise.all(idsToMark.map(id => db.updateMessageStatus(id, 'read')));
      // update local messages array status for response consistency
      messages.forEach(m => {
        if (idsToMark.includes(m.id)) {
          m.message_status = 'read';
        }
      });
    }

    return sendResponse(res, 200, 'Messages fetched', { messages });
  } catch (err) {
    return apiError(res, 'Failed to fetch messages', 500);
  }
});

export default { addMessage, addImageMessage, addAudioMessage, getMessages };
