"use client";

import { NoticePopup } from "./NoticePopup";

export default function HandleNotice() {
  return (
    <NoticePopup
      noticeId="telegram-group"
      title="Join our Telegram Group!"
      image=""
      imageAlt="Acadia"
      link="https://t.me/+8-SMvXgFfO8xNTQ9"
      linkAlt="Telegram Group"
      description="Join our Telegram group for the latest updates and support!"
      onLinkClick={() => {
        // fetch("/api/count", {
        //   method: "POST",
        // });
      }}
    />
  );
}
