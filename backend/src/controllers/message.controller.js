import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../lib/cloudinary.js';
import { getReicerSocketId, io } from '../lib/socket.js';

export const getUsersForSidebar = async (req, res) => {
    try{
        const loggedInUser = req.user._id;// Get the logged-in user's ID from the authenticated user(in the miidleware)
        // _id: { $ne: loggedInUser }means _id is not equal to loggedInUser
        const filteredUsers = await User.find({ _id: { $ne: loggedInUser } })
            .select('-password');

        res.status(200).json(filteredUsers);
    
    }catch(error){
        console.error('Error fetching users for sidebar:', error);
        res.status(500).json({ message: 'Internal server error' });

    }

}

export const getMessages = async (req, res) => {
    try{
        const {id:userToChatId} = req.params;// Get the ID of the user to chat with from the request parameters
        const myId = req.user._id;// Get the sender's ID from the authenticated user（from middleware）

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userToChatId },
                { sender: userToChatId, receiver: myId }
            ]
        });// Find messages where either the sender is the logged-in user and the receiver is the user to chat with, or vice versa
        res.status(200).json(messages);

    }catch(error){
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

export const sendMessage = async (req, res) => {
    try{
        const {text,image} = req.body;
        const {id:receiverId} = req.params;// Get the receiver's ID from the request parameters
        const senderId = req.user._id; // Get the sender's ID from the authenticated user(from middleware)

        let imageUrl;

        if(image){
            //upload image to cloudinary and get the url
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url; // Get the secure URL of the uploaded image
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl // Store the image URL if an image was uploaded
        });

        await newMessage.save(); // Save the new message to the database

        //todo: realtime functionality to send message to the receiver
        const receiverSocketId = getReicerSocketId(receiverId);
        //user is online , send the msg
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.status(201).json(newMessage); // Respond with the newly created message



    }catch(error){
        console.error('Error sending message in messagecontroller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}