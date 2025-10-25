import jwt from 'jsonwebtoken'

const adminAuth = async (req, res, next) => {
    try {
        // Support both standard Authorization: 'Bearer <token>' and legacy token header
        const authHeader = req.headers['authorization'] || req.headers['Authorization'] || req.headers['token']

        let token = null
        if (authHeader && typeof authHeader === 'string') {
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1]
            } else {
                // either a direct token value or other header form
                token = authHeader
            }
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorised User' })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        const expected = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
        if (token_decode !== expected) {
            return res.status(403).json({ success: false, message: 'User is not authorized' })
        }

        next()
    } catch (err) {
        return res.status(401).json({ success: false, message: err.message })
    }
}

export default adminAuth
