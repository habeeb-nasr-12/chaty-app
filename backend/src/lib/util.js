import jwt from "jsonwebtoken";
export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("jwt", token, {
        httpOnly: true, //prevent xss attacks cross site scripting
        secure: process.env.NODE_ENV !== "development", //secure cookie in production
        sameSite: "strict", //prevent csrf attacks
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return token;
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

