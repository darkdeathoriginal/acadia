import LoginChecker from "@/components/LoginChecker";
import User from "@/components/pages/User";

export const metadata = {
  title: "Dashboard | Acadia",
  description: "Welcome to your dashboard.",
  keywords: ["Dashboard", "Academia", "SRMIST", "SRM", "SRMIST Academia"],
};

export default function Page() {
  return (
    <LoginChecker>
      <User />
    </LoginChecker>
  );
}
