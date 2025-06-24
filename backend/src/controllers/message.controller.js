import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/soket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsers = async (req, res) => {
    const loggedInUserId = req.user._id;
    try {
        //get all users except the logged in user
        const users = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.log("error in getUsers", error.message);
        res.status(500).json({ message: error.message });
    }
}
export const getMessages = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        //get all messages that i am the sender or the receiver
        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.log("error in getMessages", error.message);
        res.status(500).json({ message: error.message });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const senderId = req.user._id;
        const receiverId = req.params.id;
        let imageUrl ;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({ senderId, receiverId, text, image: imageUrl });
        await newMessage.save();
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        
        res.status(201).json(newMessage);
    } catch (error) {
        console.log("error in sendMessage", error.message);
        res.status(500).json({ message: error.message });
    }
}