
import { addMessage, getMessages } from "../controllers/MessageController.js";

import { Router } from "express";

const router = Router();

router.post("/add-message", addMessage);
router.get("/get-messages/:from/:to", getMessages);

export default router;