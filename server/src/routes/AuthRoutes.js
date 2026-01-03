import { checkUser, onBoardUser, getUser, getAllUsers } from '../controllers/AuthController.js'
import authMiddleware from '../middlewares/AuthMiddleware.js'
import { Router } from 'express'

const router = Router();

router.post('/check-user', checkUser)
router.post('/onboard-user', onBoardUser)
router.get('/get-user', authMiddleware, getUser)
router.get('/get-contacts', authMiddleware, getAllUsers)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
})

export default router;
