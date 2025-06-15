import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {

try{
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({message: 'Not authorized, no token'});
    }
    //when there is a token - > decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //when decoded is invalid
    if (!decoded) {
        return res.status(401).json({message: 'Not authorized, token invalid'});
    }

    const user = await User.findById(decoded.userId).select('-password');//dont send password in response

    if(!user) {
        return res.status(404).json({message: 'User not found'});
    }

    req.user = user; // Attach user to request object

    next(); // Call the next middleware or route handler


}catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({message: 'Internal Server Error'});
  }
}
