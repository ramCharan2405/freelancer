import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import ChatWindow from "../components/ChatWindow";
import { FaComments, FaSpinner, FaInbox, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { socket, onlineUsers } = useSocket();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket) {
      socket.on("chat:created", handleNewChat);
      socket.on("message:receive", handleNewMessage);
      socket.on("chat:updated", handleChatUpdate);

      return () => {
        socket.off("chat:created", handleNewChat);
        socket.off("message:receive", handleNewMessage);
        socket.off("chat:updated", handleChatUpdate);
      };
    }
  }, [socket]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
              timestamp: message.createdAt || new Date(),
            },
          };
        }
        return chat;
      })
    );
  };

  const handleChatUpdate = ({ chatId, lastMessage, unreadCount }) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat._id === chatId) {
          return {
            ...chat,
            lastMessage,
            unreadCount,
            updatedAt: new Date(),
          };
        }
        return chat;
      })
    );
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
    if (diff < 86400000)
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const filteredChats = chats.filter((chat) => {
    const currentUserId = localStorage.getItem("userId");
    const userType = chat.participants?.find(
      (p) => p.userId?._id === currentUserId
    )?.userType;
    const unreadCount = chat.unreadCount?.[userType] || 0;

    const currentUserRole = user?.role;
    let otherUserName = "";

    if (currentUserRole === "company") {
      const freelancer = chat.freelancerId;
      otherUserName =
        freelancer?.fullName || freelancer?.user?.fullName || "Freelancer";
    } else {
      const company = chat.companyId;
      otherUserName =
        company?.companyName || company?.organization || "Company";
    }

    const matchesSearch =
      !searchQuery ||
      otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.jobId?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "unread" && unreadCount > 0) ||
      (filterStatus === "read" && unreadCount === 0);

    return matchesSearch && matchesStatus;
  });

  const totalChats = chats.length;
  const unreadChats = chats.filter((chat) => {
    const currentUserId = localStorage.getItem("userId");
    const userType = chat.participants?.find(
      (p) => p.userId?._id === currentUserId
    )?.userType;
    return (chat.unreadCount?.[userType] || 0) > 0;
  }).length;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 bg-slate-900 flex flex-col overflow-hidden">
      {}
      <div className="flex-1 flex overflow-hidden">
        {}
        <div className="w-full md:w-[420px] bg-slate-800 border-r border-gray-700 flex flex-col">
          {}
          <div className="p-6 border-b border-gray-700 bg-slate-800/95 backdrop-blur flex-shrink-0">
            <h1 className="text-3xl font-bold text-white flex items-center mb-4">
              <FaComments className="mr-3 text-emerald-400" />
              Messages
            </h1>

            {}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 bg-slate-700/50 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Total</p>
                <p className="text-white text-xl font-bold">{totalChats}</p>
              </div>
              <div className="flex-1 bg-blue-500/10 rounded-lg p-3">
                <p className="text-blue-400 text-xs mb-1">Unread</p>
                <p className="text-blue-400 text-xl font-bold">{unreadChats}</p>
              </div>
            </div>

            {}
            <div className="relative mb-3">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === "all"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("unread")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === "unread"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilterStatus("read")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === "read"
                    ? "bg-green-500 text-white"
                    : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                }`}
              >
                Read
              </button>
            </div>
          </div>

          {}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <FaInbox className="text-7xl text-gray-700 mb-4" />
                <p className="text-gray-400 text-lg">
                  {searchQuery
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const currentUserId = localStorage.getItem("userId");
                const userType = chat.participants?.find(
                  (p) => p.userId?._id === currentUserId
                )?.userType;
                const currentUserRole = user?.role;

                let userDetails;
                if (currentUserRole === "company") {
                  const freelancer = chat.freelancerId;
                  userDetails = {
                    name:
                      freelancer?.fullName ||
                      freelancer?.user?.fullName ||
                      "Freelancer",
                    avatar: freelancer?.profilePicture || null,
                    isOnline: onlineUsers.has(
                      freelancer?.user?._id || freelancer?._id
                    ),
                  };
                } else {
                  const company = chat.companyId;
                  userDetails = {
                    name:
                      company?.companyName ||
                      company?.organization ||
                      "Company",
                    avatar: company?.logo || company?.profilePicture || null,
                    isOnline: onlineUsers.has(company?.user?._id),
                  };
                }

                const unreadCount = chat.unreadCount?.[userType] || 0;
                const isSelected = selectedChat?._id === chat._id;

                return (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 cursor-pointer transition-all border-b border-gray-700/50 ${
                      isSelected
                        ? "bg-emerald-500/10 border-l-4 border-l-emerald-500"
                        : "hover:bg-slate-700/50"
                    }`}
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
        <div className="flex-1 flex flex-col bg-slate-900">
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              onClose={() => setSelectedChat(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
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

      {}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Messages;
