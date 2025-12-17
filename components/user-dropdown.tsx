"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import { useState } from "react";

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout, customClaim } = useAuth();
  console.log(currentUser?.photoURL, "from navbar");

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent focus:bg-transparent focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary/20 transition-colors">
            <AvatarImage
              src={currentUser?.photoURL!}
              alt={currentUser?.displayName!}
            />

            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-2"
        align="end"
        sideOffset={5}
      >
        {/* User Info Section */}
        <DropdownMenuLabel className="p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentUser?.displayName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {currentUser?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        {/* Action Buttons */}
        <div className="p-1 space-y-1">
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-sm font-normal text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            >
              My Account
            </Button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            {customClaim?.admin ? (
              <Button
                variant="ghost"
                asChild
                className="w-full justify-start h-9 px-3 text-sm font-normal text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              >
                <Link href="/admin-dashboard">Admin Dashboard</Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start h-9 px-3 text-sm font-normal text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              >
                My Favourites
              </Button>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-sm font-normal text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300"
              onClick={logout}
            >
              Logout
            </Button>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
