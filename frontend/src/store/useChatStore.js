import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance as client } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,
    getUsers: async () => {
        try {
            set({ isUserLoading: true });
            const response = await client.get("/messages/users");
            set({ users: response.data });
        } catch (error) {
            toast.error("Failed to get users");
        } finally {
            set({ isUserLoading: false });
        }
    },
    getMessages: async (userId) => {
        try {
            set({ isMessagesLoading: true });
            const response = await client.get(`/messages/${userId}`);
            set({ messages: response.data });
        } catch (error) {
            toast.error("Failed to get messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (data) => {
        const { selectedUser, messages } = get();
        try {
            const response = await client.post(`/messages/send/${selectedUser._id}`, data);
            
            // Add the message immediately for better UX, but check for duplicates
            const messageExists = messages.some(msg => msg._id === response.data._id);
            if (!messageExists) {
                set({ messages: [...messages, response.data] });
            }
        } catch (error) {
            toast.error("Failed to send message");
        }
    },
    setSelectedUser: (user) => {
        set({ selectedUser: user });
    },
    subscribeToNewMessage: () => {
        const { selectedUser } = get();
        const { socket, authUser } = useAuthStore.getState();
        if (!selectedUser || !socket) return;

        // Remove any existing listeners to prevent duplicates
        socket.off("newMessage");

        socket.on("newMessage", (message) => {
            const { selectedUser: currentSelectedUser } = get();
            
            if (!currentSelectedUser) return;
            
            // Only add the message if it's relevant to the current conversation
            const isRelevantMessage = 
                (message.senderId === currentSelectedUser._id && message.receiverId === authUser._id) || // Incoming message
                (message.senderId === authUser._id && message.receiverId === currentSelectedUser._id);   // Outgoing message
            
            if (isRelevantMessage) {
                const { messages } = get();
                
                // Check if message already exists to prevent duplicates
                const messageExists = messages.some(msg => msg._id === message._id);
                
                if (!messageExists) {
                    set({ messages: [...messages, message] });
                } else {
                    console.log("Duplicate message prevented:", message._id);
                }
            }
        });
    },
    unsubscribeFromNewMessage: () => {
        const { socket } = useAuthStore.getState();
        if (socket) {
            socket.off("newMessage");
        }
    }
}));