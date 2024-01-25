const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const authHeader = req.header('authorization')
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.sendStatus(401)
    try {
        jwt.verify(token, process.env.SECRET_KEY_JWT, (error, decoded) => {
            if (error) {
                res.status(401).json("invalid token")
            }
            req.user_id = decoded.id
            next()
        })
    } catch (error) {
        return res.sendStatus(403).json({message: 'token invalid'});
    }
}

module.exports = verifyToken