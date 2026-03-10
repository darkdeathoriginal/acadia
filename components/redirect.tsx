"use client";
import Cookie from "js-cookie";
import { useEffect } from "react";

export default function Redirect() {
  const token = Cookie.get("token") || "";

  useEffect(() => {
    if (!token && window.location.href.split("/").at(-1) !== "login") {
      window.location.href = "/login";
    }
  }, [token]);

  return null;
}
