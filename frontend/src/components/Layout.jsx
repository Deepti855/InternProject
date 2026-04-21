import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import LiveChatDrawer from "./LiveChatDrawer";
import EcoAssistantChatbot from "./EcoAssistantChatbot";
import ToastContainer from "./ui/Toast";
import { FiMessageSquare } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Layout({ children }) {
  const location = useLocation();
  const hideFloating = location.pathname.startsWith("/messages");

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <div className="flex-1 flex max-w-7xl mx-auto w-full relative">
        <Sidebar />
        <main
          className={`flex-1 md:ml-64 p-4 md:p-8 w-full z-10 ${
            hideFloating ? "" : "pb-32"
          }`}
        >
          <div className="max-w-4xl mx-auto w-full backdrop-blur-sm">
            {children}
          </div>
        </main>
      </div>

      {!hideFloating && (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-30 flex flex-col gap-3 items-end">
          {/* FAB for Messages */}
          <Link to="/messages">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] border border-blue-400/30 text-white relative"
            >
              <FiMessageSquare className="w-6 h-6" />
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-[#121212]"></span>
              </span>
            </motion.div>
          </Link>

          <LiveChatDrawer buttonClassName="w-14 h-14 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform relative" />
          <EcoAssistantChatbot buttonClassName="w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center relative" />
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
