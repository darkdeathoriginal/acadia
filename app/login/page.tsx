import Login from "@/components/login";
import React, { Suspense } from "react";

export default function page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
