import jwt from 'jsonwebtoken'
import { User } from '../models/user.js'

const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({success:true, token, message: 'Login Successful'})
        }
        else {
            res.json({success: false, message: 'Invalid Credential'})
        }
    } catch(err) {
        console.log(err)
        res.json({success: false, message: err.message})
    }
}

const adminSignup = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' })
        }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                return res.json({ success: false, message: 'Invalid email format' })
            }

            // Validate password strength
            if (password.length < 6) {
                return res.json({ success: false, message: 'Password must be at least 6 characters' })
            }

            // Check if user already exists
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists' })
        }

        // Create new user
        const newUser = await User.create({
            email,
            password,
            role: 'admin'
        })

        const token = jwt.sign(email + password, process.env.JWT_SECRET)
        res.json({ success: true, token, message: 'Account created successfully' })
    } catch (err) {
        console.log(err)
        res.json({ success: false, message: err.message })
    }
}

export { adminLogin, adminSignup }