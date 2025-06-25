import { create } from "zustand";
import { axiosInstance as client } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : window.location.origin;
export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    checkAuth: async () => {
        try {
            const response = await client.get("/auth/check");
            localStorage.setItem("chat-app-user", JSON.stringify(response.data));
            set({ authUser: response.data });
            get().connectSocket();
        } catch (error) {
            console.log("error in checkAuth", error.message);
            localStorage.removeItem("chat-app-user");
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    signup: async (data) => {
        const { fullName, email, password } = data;
        try {
            set({ isSigningUp: true });
            const response = await client.post("/auth/signup", { fullName, email, password });  
            localStorage.setItem("chat-app-user", JSON.stringify(response.data.user));
            set({ authUser: response.data.user });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            console.log("error in signup", error.response.data.message);
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },
    login: async (data) => {
        const { email, password } = data;
        try {
            set({ isLoggingIn: true });
            const response = await client.post("/auth/login", { email, password });
            localStorage.setItem("chat-app-user", JSON.stringify(response.data.user));
            set({ authUser: response.data.user });
            toast.success("Logged in successfully");
            get().connectSocket();
        } catch (error) {
            console.log("error in login", error.response.data.message);
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },
    logout: async () => {
        try {
            get().disconnectSocket();
            await client.post("/auth/logout");
            localStorage.removeItem("chat-app-user");
            set({ authUser: null, onlineUsers: [] });
        } catch (error) {
            console.log("error in logout", error.message);
            toast.error(error.response?.data?.message || "Logout failed");
        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const response = await client.put("/auth/update-profile", data);
            localStorage.setItem("chat-app-user", JSON.stringify(response.data.user));
            set({ authUser: response.data.user });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in updateProfile", error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    connectSocket: () => {
        const { authUser, socket } = get();
        if (!authUser || socket?.connected) return;
        
        const newSocket = io(BASE_URL, {
            query: { 
                userId: authUser._id 
            },
        });
        
        newSocket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
        
        newSocket.on("connect", () => {
            console.log("Socket connected successfully");
        });
        
        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
        
        set({ socket: newSocket });
    },
    disconnectSocket: () => {
        if (get().socket?.connected)
             get().socket.disconnect();
      },
  
}))