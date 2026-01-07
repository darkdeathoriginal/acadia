"use client";

import cookie from "js-cookie"; // Use the library for consistency
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "./Footer";

export default function LoginChecker({ children }) {
  const router = useRouter();
  // If you want to show a spinner, keep true. If you want blank, keep true.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use js-cookie instead of manual parsing for reliability
    const token = cookie.get("token");

    if (!token) {
      router.replace("/login");
    } else {
      setLoading(false); // Only allow content if token exists
    }
  }, [router]);

  // ❗ FIX: Do not render children while loading or redirecting
  if (loading) {
    return null; // Or return <Spinner />
  }

  return (
    <div>
      {children}
      <Footer />
    </div>
  );
}
