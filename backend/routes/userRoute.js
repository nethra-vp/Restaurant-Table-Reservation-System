import express from 'express'
import { adminLogin, adminSignup } from '../controllers/userControllers.js'

const userRouter = express.Router();

userRouter.post('/admin', adminLogin)
userRouter.post('/signup', adminSignup)

export default userRouter