import admin from '../config/firebaseAdmin.js';

export default async function authMiddleware(req, res, next) {
	const token = req.cookies?.token || req.headers?.authorization?.split?.(' ')[1];
	if (!token) {
		return res.status(401).json({ success: false, message: 'Unauthorized: no token' });
	}

	try {
		const decoded = await admin.auth().verifyIdToken(token);
		req.user = decoded;
		return next();
	} catch (err) {
		return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
	}
}
