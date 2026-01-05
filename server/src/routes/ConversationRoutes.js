import { Router } from 'express';
import { getConversations } from '../controllers/ConversationController.js';

const router = Router();

router.get('/', getConversations);

export default router;
