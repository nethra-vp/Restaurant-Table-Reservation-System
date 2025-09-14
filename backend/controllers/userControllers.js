import jwt from 'jsonwebtoken'

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

export {adminLogin}