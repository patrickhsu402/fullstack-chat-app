import jwt from 'jsonwebtoken';
export const generateToken = (userId, res)=>{

    // Generate a JWT token for the user
    const token = jwt.sign({userId},process.env.JWT_SECRET, {
        expiresIn: '7d' // Token will expire in 7 days,user will login again after 7days 
    });

    // Set the token in a cookie and send it to the client
    res.cookie('jwt',token,{
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        sameSite: 'Strict', // Helps prevent CSRF attacks
        secure: process.env.NODE_ENV !== 'development' // Use secure cookies in production
    }
    );



    return token;

};