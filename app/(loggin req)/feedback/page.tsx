import LoginChecker from "@/components/LoginChecker";
import Feedback from "@/components/pages/Feedback";
import React from "react";

export const metadata = {
  title: "Feedback | Acadia",
  description: "Academia automated feedback submission.",
  keywords: ["Feedback", "Academia", "SRMIST", "SRM", "SRMIST Academia"],
};

export default function Page() {
  return (
    <LoginChecker>
      <Feedback />
    </LoginChecker>
  );
}
