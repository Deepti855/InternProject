import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiLogOut, FiUser, FiSun, FiMoon } from "react-icons/fi";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const dropdownRef = useRef(null);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  useEffect(() => {
    document.documentElement.classList.add("dark"); // Default to dark as requested
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/showcase", label: "Showcase" },
    { path: "/dashboard", label: "Feed" },
    { path: "/create", label: "Create Post" },
    { path: "/messages", label: "Messages" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="backdrop-blur-md bg-vibin-bg/80 border-b border-vibin-border/20 sticky top-0 z-50 h-16 flex items-center transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 bg-vibin-primary rounded-lg flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <span className="text-white font-black text-xl leading-none">
              V
            </span>
          </div>
          <span className="text-2xl font-extrabold text-vibin-text tracking-tight">
            Vibin
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2 h-full">
          {navLinks.map((link) => {
            if (link.label === "Create Post") {
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-4 py-2 bg-vibin-primary text-white rounded-lg font-semibold hover:bg-vibin-primaryHover transition-colors shadow-sm text-sm"
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 font-medium transition-all text-sm ${
                  isActive(link.path)
                    ? "text-vibin-primary drop-shadow-sm"
                    : "text-vibin-muted hover:text-vibin-text"
                }`}
              >
                <span>{link.label}</span>
                {link.label === "Messages" && (
                  <span className="flex h-2 w-2 relative ml-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vibin-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-vibin-primary"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side Profile & Theme Toggle */}
        <div
          className="hidden md:flex items-center space-x-4 relative"
          ref={dropdownRef}
        >
          <button
            onClick={toggleTheme}
            className="p-2 text-vibin-muted hover:text-vibin-text transition-colors rounded-full bg-vibin-card shadow-sm border border-vibin-border/20"
          >
            {isDarkMode ? (
              <FiSun className="w-5 h-5" />
            ) : (
              <FiMoon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 hover:bg-gray-50 rounded-full pr-2 transition-colors border border-transparent hover:border-gray-200 focus:outline-none"
          >
            <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.username}
                </p>
              </div>
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FiUser className="w-4 h-4 text-gray-500" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <FiLogOut className="w-4 h-4 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900 p-2 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-vibin-card/95 backdrop-blur-md border-b border-vibin-border/40 shadow-xl">
          <div className="p-4 grid grid-cols-2 gap-2">
            {[
              ...navLinks,
              { path: "/profile", label: "Profile" },
              { path: "/messages", label: "Messages" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm border transition-colors ${
                  isActive(link.path)
                    ? "border-vibin-primary/40 text-vibin-primary bg-vibin-primary/10"
                    : "border-transparent text-vibin-text hover:bg-vibin-border/20"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="col-span-2 text-left px-3 py-2 rounded-lg font-semibold text-sm text-red-600 hover:bg-red-50 border border-transparent"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
