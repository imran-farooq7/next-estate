// components/advanced-navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Home, LogIn, UserPlus } from "lucide-react";
import GoogleBtn from "./google-btn";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EstatePro
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  Find Your Dream Home
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Search Properties Link Button */}
            <Button
              variant="outline"
              asChild
              className={`flex items-center space-x-2 border-2 transition-all duration-200 ${
                pathname === "/properties"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-blue-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <Link href="/properties">
                <Search className="w-4 h-4" />
                <span className="font-semibold">Search Properties</span>
              </Link>
            </Button>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                asChild
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  pathname === "/login"
                    ? "text-blue-600 bg-blue-50 border border-blue-200"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <Link href="/login">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </Button>

              <Button
                asChild
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link href="/register" className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Search Properties Link for Mobile */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center space-x-1 border-blue-200 text-blue-700"
            >
              <Link href="/properties">
                <Search className="w-4 h-4" />
                <span className="sr-only lg:not-sr-only lg:inline">Search</span>
              </Link>
            </Button>

            {/* Auth Buttons for Mobile */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-700"
              >
                <Link href="/login">Login</Link>
              </Button>

              <Button
                size="sm"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
