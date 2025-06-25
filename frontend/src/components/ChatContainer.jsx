import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./Skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

export const ChatContainer = () => {
    const { selectedUser, messages, isMessagesLoading, getMessages, subscribeToNewMessage, unsubscribeFromNewMessage } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    
    useEffect(() => {
        if (selectedUser?._id) {
            getMessages(selectedUser._id);
            subscribeToNewMessage();
        }
        
        return () => {
            unsubscribeFromNewMessage();
        }
    }, [selectedUser?._id]); // Only depend on selectedUser._id to avoid re-subscriptions
    
    useEffect(() => {
        if (messageEndRef.current && messages ) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]); 
    
    if (isMessagesLoading) return <div className="flex-1 flex flex-col overflow-auto ">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
    </div>
  
    return (
        <div className="flex-1 flex-col overflow-y-auto">
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div ref={messageEndRef} key={message._id} className={`chat ${message?.senderId === authUser._id ? "chat-end" : "chat-start"}`}>
                        <div className="chat-image avatar">
                            <div className="size-10 rounded-full border ">
                                <img src={message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"} alt="profile pic" />
                            </div>
                        </div>
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">{formatMessageTime(message.createdAt)}</time>

                        </div>
                        <div className="chat-bubble flex flex-col ">
                            {message.image && (
                                <img src={message.image} alt="message" className="sm:max-w-[200px] object-cover rounded-md mb-2" />
                            )}
                            {message.text && (
                                <p>{message.text}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <MessageInput />
        </div>
    )
}
