import React, { useState, useEffect } from "react";
import { FaComments, FaSpinner, FaInbox } from "react-icons/fa";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import ChatWindow from "./ChatWindow";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const ChatList = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("chat:created", handleNewChat);
      socket.on("message:receive", handleNewMessage);
      return () => {
        socket.off("chat:created", handleNewChat);
        socket.off("message:receive", handleNewMessage);
      };
    }
  }, [socket]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setChats(data.chats);
      }
    } catch (error) {
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = (newChat) => {
    setChats((prev) => [newChat, ...prev]);
    toast.success("New chat created!");
  };

  const handleNewMessage = (message) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat._id === message.chatId) {
          return {
            ...chat,
            lastMessage: {
              content: message.content,
              senderId: message.senderId,
              timestamp: message.createdAt,
            },
          };
        }
        return chat;
      })
    );
  };

  const getUserDetails = (chat) => {
    const currentUserRole = user?.role;

    if (currentUserRole === "company") {
      const freelancer = chat.freelancerId;
      return {
        type: "freelancer",
        name:
          freelancer?.fullName || freelancer?.user?.fullName || "Freelancer",
        avatar: freelancer?.profilePicture || null,
        isOnline: onlineUsers.has(freelancer?.user?._id || freelancer?._id),
      };
    } else {
      const company = chat.companyId;
      return {
        type: "company",
        name: company?.companyName || company?.organization || "Company",
        avatar: company?.logo || company?.profilePicture || null,
        isOnline: onlineUsers.has(company?.user?._id),
      };
    }
  };

  const formatLastMessage = (message) => {
    if (!message || !message.content) return "No messages yet";
    return message.content.length > 50
      ? message.content.substring(0, 50) + "..."
      : message.content;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-emerald-400 text-5xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col pt-16">
      <div className="flex-1 flex overflow-hidden">
        {}
        <div className="w-full md:w-[420px] bg-slate-800 border-r border-gray-700 flex flex-col">
          {}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <FaComments className="mr-3 text-emerald-400" />
              Messages
              {chats.length > 0 && (
                <span className="ml-3 bg-emerald-500 text-white text-sm px-3 py-1 rounded-full">
                  {chats.length}
                </span>
              )}
            </h2>
          </div>

          {}
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <FaInbox className="text-7xl text-gray-700 mb-4" />
                <p className="text-gray-400 text-lg">No conversations yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  {user?.role === "company"
                    ? "Accept applications to start chatting"
                    : "Apply for jobs to start conversations"}
                </p>
              </div>
            ) : (
              chats.map((chat) => {
                const userDetails = getUserDetails(chat);
                const currentUserId = localStorage.getItem("userId");
                const userType = chat.participants?.find(
                  (p) => p.userId?._id === currentUserId
                )?.userType;
                const unreadCount = chat.unreadCount?.[userType] || 0;

                return (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className="p-4 border-b border-gray-700/50 hover:bg-slate-700/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {}
                      <div className="relative flex-shrink-0">
                        {userDetails.avatar ? (
                          <img
                            src={userDetails.avatar}
                            alt={userDetails.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {userDetails.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        {userDetails.isOnline && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-slate-800 rounded-full"></div>
                        )}
                      </div>

                      {}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white text-base truncate">
                            {userDetails.name}
                          </h3>
                          <span className="text-gray-500 text-xs">
                            {formatTime(chat.lastMessage?.timestamp)}
                          </span>
                        </div>
                        <p className="text-emerald-400 text-xs mb-1 truncate">
                          {chat.jobId?.title || "Job"}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-400 text-sm truncate">
                            {formatLastMessage(chat.lastMessage)}
                          </p>
                          {unreadCount > 0 && (
                            <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {}
        <div className="flex-1 bg-slate-900">
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              onClose={() => setSelectedChat(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <FaComments className="text-9xl text-gray-700 mb-6" />
              <h2 className="text-2xl font-bold text-gray-400 mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-500 text-lg">
                Choose from your existing conversations to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
