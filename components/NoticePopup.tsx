/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";

// Simple cookie utility (remains unchanged)
const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const NoticePopup = ({
  noticeId,
  title,
  description,
  image,
  imageAlt = "",
  link,
  linkAlt = "Learn more",
  autoShow = true,
  expiryDays = 365,
  onLinkClick,
}) => {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (!autoShow || !noticeId) return;

    const lastSeenNotice = getCookie(`notice_${noticeId}`);
    if (!lastSeenNotice) {
      setShowNotice(true);
    }
  }, [noticeId, autoShow]);

  const handleClose = () => {
    setShowNotice(false);
    if (noticeId) {
      setCookie(`notice_${noticeId}`, "seen", expiryDays);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!showNotice) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full transform transition-all border border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              {title && (
                <h2 className="text-xl font-bold text-gray-100 mb-2">
                  {title}
                </h2>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-200 ml-4"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {image && (
            <div className="mb-4 flex justify-center">
              {/* The image is now a link that opens in a new tab */}
              <a
                href={image}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-xs lg:max-h-64 max-h-96 py-2 bg-gray-900 rounded-lg overflow-hidden group"
                title="Click to view full image"
              >
                <img
                  src={image}
                  alt={imageAlt}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </a>
            </div>
          )}

          {description && (
            <p className="text-gray-300 mb-6 leading-relaxed">{description}</p>
          )}

          <div className="flex gap-3">
            {link && (
              <a
                href={link}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClick?.()}
              >
                {linkAlt}
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
