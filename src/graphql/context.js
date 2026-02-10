const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getUser = async (token) => {
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return await User.findById(decoded.id).select('-password');
        } catch (err) {
            throw new Error('Invalid token');
        }
    }
};

const context = async ({ req }) => {
    // Get the user token from the headers.
    const token = req.headers.authorization || '';

    // Attempt to retrieve the user if the token is present
    // The format is usually "Bearer <token>", so we split it.
    console.log("Header Token:", token);
    const splitToken = token.split(' ')[1];

    if (splitToken) {
        const user = await getUser(splitToken);
        return { user };
    }

    return { user: null };
};

module.exports = context;
