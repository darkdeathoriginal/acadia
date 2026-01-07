import React from "react";

export default function MiddleSection({ children }) {
  return (
    <div className="overflow-auto h-[calc(100vh-152px)] mb-[72px]">
      {children}
    </div>
  );
}
