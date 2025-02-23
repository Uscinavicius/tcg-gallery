"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Nav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.status === 200) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAuth();
  }, []);

  // Only show nav when on admin routes or when authenticated on the main page
  if (!pathname.startsWith('/admin') && !isAdmin) {
    return null;
  }

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-gray-800 text-white fixed top-0 z-50">
      <Link
        href="/"
        className="text-2xl font-bold hover:text-gray-300 transition-colors"
      >
        Collection
      </Link>
      <div className="flex gap-4">
        <Link
          href="/admin"
          className="text-2xl font-bold hover:text-gray-300 transition-colors"
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}
