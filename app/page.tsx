import { redirect } from "next/navigation";
import React from "react";

export default async function Home() {
  return (
    <div className="flex mx-20 gap-4 flex-col mb-20">
      {redirect("/attendance")}
    </div>
  );
}
