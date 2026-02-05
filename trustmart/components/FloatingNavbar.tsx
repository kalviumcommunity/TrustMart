"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Star, Settings, LogOut, User, Home, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function FloatingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const checkAuth = () => {
      const businessData = localStorage.getItem("business");
      if (businessData) {
        try {
          const parsed = JSON.parse(businessData);
          setIsLoggedIn(true);
          setBusiness(parsed);
        } catch (error) {
          setIsLoggedIn(false);
          setBusiness(null);
        }
      } else {
        setIsLoggedIn(false);
        setBusiness(null);
      }
    };

    handleScroll();
    checkAuth();
    window.addEventListener("scroll", handleScroll);
    
    // Check auth periodically
    const authInterval = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(authInterval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("business");
    document.cookie = "business_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    setIsLoggedIn(false);
    setBusiness(null);
    router.push("/");
    setIsOpen(false);
  };

  const publicNavItems: NavItem[] = [
    { label: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { label: "Businesses", href: "/businesses", icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Login", href: "/login", icon: <User className="w-4 h-4" /> },
    { label: "Sign Up", href: "/signup", icon: <Star className="w-4 h-4" /> },
  ];

  const privateNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Settings", href: "/business-settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const navItems = isLoggedIn ? privateNavItems : publicNavItems;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 backdrop-blur-lg transition-all duration-300",
          scrolled ? "bg-white/90 shadow-lg" : "bg-white/10",
          isOpen ? "rounded-b-none" : "rounded-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className={cn(
              "font-bold text-lg transition-colors",
              scrolled ? "text-gray-900" : "text-white"
            )}>
              TrustMart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200",
                  scrolled 
                    ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900" 
                    : "text-white/90 hover:bg-white/20 hover:text-white"
                )}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
            
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200",
                  scrolled 
                    ? "text-red-600 hover:bg-red-50" 
                    : "text-red-400 hover:bg-red-500/20"
                )}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
              scrolled 
                ? "text-gray-700 hover:bg-gray-100" 
                : "text-white hover:bg-white/20"
            )}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden rounded-b-2xl border-t border-white/20 bg-white/90 backdrop-blur-lg md:hidden"
            >
              <div className="px-6 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                
                {isLoggedIn && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="px-4 py-2">
                      <p className="text-sm text-gray-600">Logged in as:</p>
                      <p className="text-sm font-medium text-gray-900">{business?.business_name}</p>
                      <p className="text-xs text-gray-500">{business?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
    </>
  );
}
