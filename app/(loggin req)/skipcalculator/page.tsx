import LoginChecker from "@/components/LoginChecker";
import SkipCalculator from "@/components/pages/SkipCalculator";

export const metadata = {
  title: "Skip Pro | Acadia",
  description:
    "Calculate how many classes you can safely skip while maintaining 75% attendance.",
  keywords: [
    "Skip Calculator",
    "Attendance",
    "Safe Leave",
    "SRMIST",
    "SRM",
    "Acadia",
  ],
};

export default function Page() {
  return (
    <LoginChecker>
      <SkipCalculator />
    </LoginChecker>
  );
}
