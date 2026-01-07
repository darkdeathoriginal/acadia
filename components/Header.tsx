"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Header({ title }) {
  const [clicked, setClicked] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (Cookies.get("token")) {
      setShow(true);
    }
  }, []);
  const pages = [
    {
      title: "Planner",
      link: "/planner",
    },
    {
      title: "CGPA Calculator",
      link: "/cgpacalculator",
    },
    {
      title: "Auto Feedback",
      link: "/feedback",
    },
  ];

  return (
    <div className="text-white py-3 rounded-md text-lg flex justify-between w-full items-center">
      <div className="px-4">
        <h1
          onDoubleClick={() => {
            window.location.href = "/feedback";
          }}
        >
          {title}
        </h1>
      </div>
      {show && (
        <div
          className={clicked ? "menu-icon clicked z-30 relative" : "menu-icon"}
          onClick={() => setClicked(!clicked)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
      <div
        className={`fixed inset-y-0 right-0 z-20 mt-10 w-[200px] bg-black transform transition-transform duration-300 ease-in-out ${
          clicked ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full p-4">
          <ul className="flex flex-col gap-4 pt-4">
            {pages.map((page, index) => (
              <li key={index}>
                <Link href={page.link} prefetch={false}>
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {clicked && (
        <div
          className="fixed inset-0 z-10 "
          onClick={() => setClicked(false)}
        />
      )}
    </div>
  );
}
