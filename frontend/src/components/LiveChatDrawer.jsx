import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import { FiMessageSquare, FiX } from "react-icons/fi";

export default function LiveChatDrawer({ buttonClassName = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on("user_status", ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === "online") next.add(userId);
        else next.delete(userId);
        return next;
      });
    });
    return () => socket.off("user_status");
  }, [socket]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          buttonClassName ||
          "fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform z-40"
        }
      >
        <FiMessageSquare className="w-6 h-6" />
        {onlineUsers.size > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-80 h-full glass-card border-l border-white/60 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-200/50 flex justify-between items-center bg-white/40">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
                  Live Chat
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Online Users ({onlineUsers.size})
                </h3>
                {onlineUsers.size === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center mt-10">
                    No one is online right now.
                  </p>
                ) : (
                  Array.from(onlineUsers).map((id) => (
                    <div
                      key={id}
                      className="flex items-center space-x-3 mb-4 p-2 rounded-xl hover:bg-white/50 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary-200 to-pink-200 rounded-full flex items-center justify-center font-bold text-gray-700">
                          U
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        User {id}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-white/60 border-t border-white/50">
                <p className="text-xs text-center text-gray-500 font-medium">
                  Global chat room coming soon.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
