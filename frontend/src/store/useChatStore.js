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
            set({ messages: [...messages, response.data] });
        } catch (error) {
            toast.error("Failed to send message");
        }
    },
    setSelectedUser: (user) => {
        set({ selectedUser: user });
    },
    subscribeToNewMessage: () => {
        const {selectedUser } = get();
        const { socket } = useAuthStore.getState();
        if(!selectedUser) return;
    
        if(socket){
             socket.on("newMessage", (message) => {
              const isMessageSentFromSelectedUser = message.senderId === selectedUser._id;
                if(!isMessageSentFromSelectedUser) return;
                set({ messages: [...get().messages, message] });
            });
        }
    },
    unsubscribeFromNewMessage: () => {
        const { socket } = useAuthStore.getState();
        if(socket){
            socket.off("newMessage");
        }
    }
 
}));