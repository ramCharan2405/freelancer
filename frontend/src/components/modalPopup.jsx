import React, { useEffect, useState } from "react";

const ModalPopup = ({ isOpen, onClose, onSave, title, existingData, placeholder }) => {
  const [message, setMessage] = useState(existingData || "");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-lg flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 transform transition-all duration-300">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <textarea
          name="message"
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex justify-end space-x-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={() => {
              if (message.trim() !== "") {
                onSave(message);
                onClose();
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPopup;
