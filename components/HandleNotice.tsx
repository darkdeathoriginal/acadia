"use client";

import { NoticePopup } from "./NoticePopup";

export default function HandleNotice() {
  return (
    <NoticePopup
      noticeId="acadia-open"
      title="Acadia is now Open Source!"
      image=""
      imageAlt="Acadia"
      link="https://github.com/darkdeathoriginal/acadia"
      linkAlt="GitHub Repository"
      description="Acadia is now open source! Explore the code, contribute, or customize it for your needs. Check out our GitHub repository to get started."
      onLinkClick={() => {
        // fetch("/api/count", {
        //   method: "POST",
        // });
      }}
    />
  );
}
