import LoginChecker from "@/components/LoginChecker";
import Mark from "@/components/pages/Mark";
import React from "react";

export const metadata = {
  title: "Mark | Acadia",
  description:
    "Check your mark with ease. Simple and easy way to get academic details.",
  keywords: [
    "Mark",
    "Academia",
    "SRMIST",
    "SRM",
    "SRMIST Academia",
    "srm",
    "acadia srm",
    "srm acadia",
    "srmist acadia",
  ],
};

export default function Page() {
  return (
    <LoginChecker>
      <Mark />
    </LoginChecker>
  );
}
