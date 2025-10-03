import React, { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaPaperPlane,
  FaPaperclip,
  FaFile,
  FaImage,
  FaSpinner,
  FaCheckDouble,
  FaCheck,
  FaArrowLeft,
  FaBriefcase,
  FaMapMarkerAlt,
  FaBuilding,
  FaGlobe,
  FaStar,
  FaDollarSign,
  FaComments,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const ChatWindow = ({ chat, onClose, isModal = false }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket, isConnected, onlineUsers } = useSocket();

  useEffect(() => {
    if (chat) {
      fetchMessages();
      joinChatRoom();
      markAsRead();
    }
    return () => {
      if (chat && socket) {
        socket.emit("chat:leave", chat._id);
      }
    };
  }, [chat]);

  useEffect(() => {
    if (socket) {
      socket.on("message:receive", handleNewMessage);
      socket.on("user:typing", handleTypingStart);
      socket.on("user:stop-typing", handleTypingStop);
      return () => {
        socket.off("message:receive", handleNewMessage);
        socket.off("user:typing", handleTypingStart);
        socket.off("user:stop-typing", handleTypingStop);
      };
    }
  }, [socket, messages]);

  const scrollToBottom = (behavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior,
        block: "end",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const isInitialLoad = messages.length === 1;
      scrollToBottom(isInitialLoad ? "auto" : "smooth");
    }
  }, [messages]);

  const joinChatRoom = () => {
    if (socket && chat) {
      socket.emit("chat:join", chat._id);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/messages/${chat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/messages/${chat._id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {}
  };

  const handleNewMessage = (message) => {
    if (message.chatId === chat._id) {
      const formattedMessage = {
        ...message,

        senderId: message.senderId?._id
          ? message.senderId
          : { _id: message.senderId },
      };

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === formattedMessage._id);
        if (exists) {
          return prev;
        }
        return [...prev, formattedMessage];
      });

      markAsRead();
    }
  };

  const handleTypingStart = ({ chatId }) => {
    if (chatId === chat._id) setTyping(true);
  };

  const handleTypingStop = ({ chatId }) => {
    if (chatId === chat._id) setTyping(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (socket && value.trim()) {
      socket.emit("typing:start", { chatId: chat._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing:stop", { chatId: chat._id });
      }, 2000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const messageContent = newMessage.trim();
    if (!messageContent && !selectedFile) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("chatId", chat._id);
      formData.append("content", messageContent);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await fetch(`${API_URL}/messages/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        if (socket) {
          socket.emit("typing:stop", { chatId: chat._id });
        }
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) return "Today";
    if (messageDate.toDateString() === yesterday.toDateString())
      return "Yesterday";
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUserDetails = () => {
    const currentUserRole = user?.role;

    if (currentUserRole === "company") {
      const freelancer = chat.freelancerId;
      return {
        type: "freelancer",
        name:
          freelancer?.fullName || freelancer?.user?.fullName || "Freelancer",
        avatar: freelancer?.profilePicture || null,
        bio: freelancer?.bio || "Freelancer Profile",
        location: freelancer?.location || "Location not specified",
        skills: freelancer?.skills || [],
        experience: freelancer?.experience || "Not specified",
        hourlyRate: freelancer?.hourlyRate || null,
        rating: freelancer?.rating || 0,
        portfolio: freelancer?.portfolio || null,
        email: freelancer?.user?.email || "Email not available",
        isOnline: onlineUsers.has(freelancer?.user?._id || freelancer?._id),
      };
    } else {
      const company = chat.companyId;
      return {
        type: "company",
        name: company?.companyName || company?.organization || "Company",
        avatar: company?.logo || company?.profilePicture || null,
        industry: company?.industry || "Industry not specified",
        location: company?.location || "Location not specified",
        website: company?.website || null,
        description: company?.description || "No description available",
        email: company?.user?.email || "Email not available",
        isOnline: onlineUsers.has(company?.user?._id),
      };
    }
  };

  const userDetails = getUserDetails();

  if (!chat) return null;

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {}
      <div className="bg-slate-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors md:hidden"
            >
              <FaArrowLeft className="text-gray-400" />
            </button>
          )}

          {}
          <div
            className="relative flex-shrink-0 cursor-pointer"
            onClick={() => setShowUserDetails(!showUserDetails)}
          >
            {userDetails.avatar ? (
              <img
                src={userDetails.avatar}
                alt={userDetails.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {userDetails.name.charAt(0)}
                </span>
              </div>
            )}
            {userDetails.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-slate-800 rounded-full"></div>
            )}
          </div>

          {}
          <div className="flex-1 min-w-0">
            <h3
              className="text-white font-semibold text-lg truncate cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => setShowUserDetails(!showUserDetails)}
            >
              {userDetails.name}
            </h3>
            <p className="text-emerald-400 text-sm truncate flex items-center">
              <FaBriefcase className="mr-1.5" />
              {chat.jobId?.title || "Job Position"}
            </p>
          </div>

          {}
          <button
            onClick={() => setShowUserDetails(!showUserDetails)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {showUserDetails ? (
              <FaChevronUp className="text-gray-400" />
            ) : (
              <FaChevronDown className="text-gray-400" />
            )}
          </button>
        </div>

        {}
        {showUserDetails && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="space-y-3 text-sm">
              {userDetails.type === "freelancer" ? (
                <>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FaDollarSign className="text-emerald-400" />
                    <span>${userDetails.hourlyRate}/hr</span>
                    <span className="text-gray-600">•</span>
                    <FaStar className="text-yellow-400" />
                    <span>{userDetails.rating.toFixed(1)}</span>
                  </div>
                  {userDetails.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {userDetails.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-300">
                  <p className="flex items-center gap-2">
                    <FaBuilding className="text-emerald-400" />
                    {userDetails.industry}
                  </p>
                  {userDetails.website && (
                    <a
                      href={userDetails.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mt-2"
                    >
                      <FaGlobe />
                      Visit Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {}
      <div
        className="flex-1 overflow-y-auto p-4 bg-slate-900 space-y-4 custom-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <FaSpinner className="animate-spin text-emerald-400 text-4xl" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FaComments className="text-7xl text-gray-700 mb-4" />
            <p className="text-gray-400 text-lg">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const currentUserId = localStorage.getItem("userId");
            let messageSenderId;
            if (
              typeof message.senderId === "object" &&
              message.senderId !== null
            ) {
              messageSenderId = message.senderId._id;
            } else {
              messageSenderId = message.senderId;
            }

            const isOwn = String(messageSenderId) === String(currentUserId);

            const showDate =
              index === 0 ||
              formatDate(messages[index - 1]?.createdAt) !==
                formatDate(message.createdAt);

            return (
              <React.Fragment key={message._id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="bg-slate-700 text-gray-400 px-3 py-1 rounded-full text-xs">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[70%]">
                    {message.messageType === "system" ? (
                      <div className="bg-slate-700/50 text-gray-300 px-4 py-2 rounded-lg text-center text-sm">
                        {message.content}
                      </div>
                    ) : (
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-sm"
                            : "bg-slate-700 text-gray-200 rounded-bl-sm"
                        }`}
                      >
                        {!isOwn && message.senderId?.fullName && (
                          <p className="text-emerald-400 text-xs mb-1 font-medium">
                            {message.senderId.fullName}
                          </p>
                        )}

                        {message.fileUrl && (
                          <div className="mb-2">
                            {message.messageType === "image" ? (
                              <img
                                src={message.fileUrl}
                                alt="attachment"
                                className="max-w-full rounded-lg cursor-pointer"
                                onClick={() =>
                                  window.open(message.fileUrl, "_blank")
                                }
                              />
                            ) : (
                              <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                              >
                                <FaFile />
                                <span>{message.fileName}</span>
                              </a>
                            )}
                          </div>
                        )}

                        <p className="break-words text-sm">{message.content}</p>

                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                            isOwn ? "text-emerald-100" : "text-gray-400"
                          }`}
                        >
                          <span>{formatTime(message.createdAt)}</span>
                          {isOwn &&
                            (message.isRead ? (
                              <FaCheckDouble className="text-blue-300" />
                            ) : (
                              <FaCheck />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-gray-400 px-4 py-2 rounded-2xl">
              <span className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                >
                  .
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                >
                  .
                </span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {}
      <div className="p-4 border-t border-gray-700 bg-slate-800">
        {selectedFile && (
          <div className="mb-3 flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg">
            {selectedFile.type.startsWith("image/") ? (
              <FaImage className="text-emerald-400" />
            ) : (
              <FaFile className="text-emerald-400" />
            )}
            <span className="text-sm text-gray-300 truncate flex-1">
              {selectedFile.name}
            </span>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-red-400 hover:text-red-300"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || sending}
            className="p-3 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaPaperclip />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            disabled={sending || !isConnected}
            autoFocus
          />

          <button
            type="submit"
            disabled={
              sending || (!newMessage.trim() && !selectedFile) || !isConnected
            }
            className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all disabled:opacity-50"
          >
            {sending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </form>

        {!isConnected && (
          <p className="text-yellow-400 text-xs mt-2 text-center animate-pulse">
            Connecting to chat server...
          </p>
        )}
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

export default ChatWindow;
