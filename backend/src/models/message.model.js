import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',// Reference to User model
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',// Reference to User model
        required: true
    },
    text: { 
        type: String,
    },
    image:{
        type: String,
    },
}, {
    timestamps: true
}// Automatically manage createdAt and updatedAt fields
);

const Message = mongoose.model('Message', messageSchema);
export default Message;