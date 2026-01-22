import axios from 'axios';

export default async function authMiddleware(req, res, next) {
	const token = req.headers?.authorization?.split?.(' ')[1];
	
	if (!token) {
		return res.status(401).json({ success: false, message: 'Unauthorized: no token' });
	}

	try {
		// Verify Google OAuth access token
		const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
		
		if (response.data && response.data.email) {
			// Token is valid, attach user info to request
			req.user = {
				email: response.data.email,
				email_verified: response.data.email_verified === 'true',
				name: response.data.name,
				picture: response.data.picture,
				sub: response.data.sub, // Google user ID
			};
			return next();
		} else {
			return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
		}
	} catch (err) {
		console.error('Token verification error:', err.response?.data || err.message);
		return res.status(401).json({ success: false, message: 'Unauthorized: token verification failed' });
	}
}
