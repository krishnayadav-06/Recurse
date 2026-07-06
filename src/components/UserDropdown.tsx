"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import {
  User as UserIcon,
  Settings,
  LogOut,
  Keyboard,
  CreditCard,
  LogIn
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
  };

  const handleLogIn = () => {
    router.push('?auth=login', { scroll: false });
    setIsOpen(false);
  };

  if (!user) {
    return (
      <button
        onClick={handleLogIn}
        className="flex items-center gap-2 border border-transparent hover:border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 hover:shadow-sm"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:block">Login</span>
      </button>
    );
  }

  const initial = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors cursor-pointer select-none"
      >
        <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {initial}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block truncate max-w-[100px]">
          {user.email?.split('@')[0]}
        </span>
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden transform origin-top-right transition-all">

          {/* Header */}
          <div className="px-3 py-3 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {user.email?.split('@')[0]}
              </span>
              <span className="text-xs text-gray-500 truncate">{user.email}</span>
            </div>
          </div>

          <div className="p-1">
            <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-700 transition-colors group text-sm cursor-pointer">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                <span>Billing</span>
              </div>
              <span className="text-xs text-gray-400 font-mono border border-gray-200 rounded px-1">PRO</span>
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-700 transition-colors group text-sm cursor-pointer">
              <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-700 transition-colors group text-sm cursor-pointer">
              <Keyboard className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              <div className="flex items-center justify-between w-full">
                <span>Shortcuts</span>
                <span className="text-xs text-gray-400 font-mono border border-gray-200 rounded px-1">⌘K</span>
              </div>
            </button>
          </div>

          <div className="p-1 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors group text-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
              <span>Log out</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
