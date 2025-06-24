import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
    },
});
// store online users {userId: socketId}
const userSocketMap = {};
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if(userId && userId !== "undefined"){
        userSocketMap[userId] = socket.id;
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        console.log("a user connected", socket.id, "userId:", userId);
    }
    
    socket.on("disconnect", () => {
        if(userId && userId !== "undefined"){
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
            console.log("a user disconnected", socket.id, "userId:", userId);
        }
    });
});
export const getReceiverSocketId = (userId) => {
    return userSocketMap[userId] 
}
export { io, app, server };