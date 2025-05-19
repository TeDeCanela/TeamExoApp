const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (payload) => {
    console.log('Payload:', payload)
    const token = jwt.sign(payload,
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );
    return token;
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports= {generateToken, verifyToken};