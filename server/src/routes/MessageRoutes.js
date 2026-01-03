import { addMessage, addImageMessage, addAudioMessage, getMessages } from "../controllers/MessageController.js";
import { Router } from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/add-message", addMessage);
router.post("/add-image-message", upload.single('image'), addImageMessage);
router.post("/add-audio-message", upload.single('audio'), addAudioMessage);
router.get("/get-messages/:from/:to", getMessages);

export default router;