import { generateToken } from "../lib/util.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ fullName, email, password: hashedPassword });
        await user.save();
        if (user) {
            generateToken(user._id, res);
            res.status(201).json({
                message: "User created successfully", user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    profilePic: user.profilePic,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("error in signup", error.message);
        res.status(500).json({ message: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        generateToken(user._id, res);
        res.status(200).json({
            message: "Login successful", user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    } catch (error) {
        console.log("error in login", error.message);
        res.status(500).json({ message: error.message });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.log("error in logout", error.message);
        res.status(500).json({ message: error.message });
    }
}


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;
        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture is required" });
        }
        const uploadedResponse = await cloudinary.uploader.upload(profilePic);
        const user = await User.findByIdAndUpdate(userId, { profilePic: uploadedResponse.secure_url }, { new: true });
        res.status(200).json({
            message: "Profile updated successfully", 
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });

    } catch (error) {
        console.log("error in updateProfile", error.message);
        res.status(500).json({ message: error.message });
    }

}
export const checkAuth = async (req, res) => {
    try {
        res.status(200).json({
            _id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email,
            profilePic: req.user.profilePic,
            createdAt: req.user.createdAt,
            updatedAt: req.user.updatedAt,
        });
    } catch (error) {
        console.log("error in checkAuth", error.message);
        res.status(500).json({ message: error.message });
    }
}