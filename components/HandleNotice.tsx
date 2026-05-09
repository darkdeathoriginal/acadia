"use client";

import { NoticePopup } from "./NoticePopup";

export default function HandleNotice() {
  return (
    <NoticePopup
      noticeId="thank-you"
      title="Thank You for using Acadia!"
      image=""
      imageAlt="Acadia"
      link="https://t.me/+8-SMvXgFfO8xNTQ9"
      linkAlt="Telegram Group"
      description="Thank you for being a part of Acadia over the past few years. As I graduate from college, I’ll no longer be able to actively maintain the project.

That said, I would love to see Acadia continue to grow. If you’re interested in development and would like to contribute, the codebase is available in the GitHub repository so the project can live on through the community.

If you have any questions or would like to get involved, feel free to join the Telegram group.
"
      onLinkClick={() => {
        // fetch("/api/count", {
        //   method: "POST",
        // });
      }}
    />
  );
}
