import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {

    const { fullName,email, password } = req.body;

    try{
        if(!fullName || !email || !password) {
            return res.status(400).json({message:'Please fill all the fields'});
        }
     
        if(password.length < 6) {
            return res.status(400).json({message:'Password must be at least 6 characters long'});
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({message:'User already exists with this email'});
        }

        //hash pwd
        const salt = await bcrypt.genSalt(10);//10 means 10 rounds of hashing
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user
        //fullName and email r same so we dont hv to change like pwd
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if(newUser){
            //generate token(jwt)
            generateToken(newUser._id, res);
            await newUser.save();// Save the new user to the database
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,// Generate and send token

            });
        }else{
            res.status(400).json({message:'Invalid User Data '});
        }
    }catch (error) {
        // console.log("Error in signup controller:", error.message);
        res.status(500).json({message:'Internal Server error'});
    }
};

export const login = async(req, res) => {
    const { email, password } = req.body;
    try{
        //check if user is in db
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({message:'User does not exist with this email'});
        }

        //check
        const isPasswordCorrect = await bcrypt.compare(password, user.password); 
        if (!isPasswordCorrect) {
            return res.status(400).json({message:'Incorrect password'});
        }
        
        // Generate and send token
        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic, 
        });


    }catch (error) {
        // console.log("Error in login controller:", error.message);
        res.status(500).json({message:'Internal Server error'});
    }
};

export const logout = (req, res) => {
    //clear out the cookie
    try{
        res.cookie("jwt", "", {maxAge:0});// Set the cookie to expire immediately
        // Optionally, you can also clear the user session or any other related data here
        res.status(200).json({message:'User logged out successfully'});
    }catch(error){
        console.log("Error in logout controller:", error.message);
        res.status(500).json({message:'Internal Server error'});

    }
};

export const updateProfile = async (req, res) => {
    try{
        const{profilePic} = req.body;
        const userId = req.user._id; // user id from protectRoute middleware

        if(!profilePic) {
            return res.status(400).json({message:'Please provide a profile picture URL'});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);// Upload the image to Cloudinary
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url }, // Update with the secure URL from Cloudinary
            { new: true } // Return the updated user
        );

        res.status(200).json(updatedUser);


    }catch (error) {
        console.log("Error in updateProfile controller:", error.message);
        res.status(500).json({message:'Internal Server error'});
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user); // user from protectRoute middleware
    } catch (error) {
        console.log("Error in checkAuth controller:", error.message);
        res.status(500).json({message:'Internal Server error'});
    }
}

