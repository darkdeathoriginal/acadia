import LoginChecker from "@/components/LoginChecker";
import User from "@/components/pages/User";
import React from "react";

export const metadata = {
  title: "User | Acadia",
  description: "User details.",
  keywords: ["User", "Academia", "SRMIST", "SRM", "SRMIST Academia"],
};

export default function Page() {
  return (
    <LoginChecker>
      <User />
    </LoginChecker>
  );
}
