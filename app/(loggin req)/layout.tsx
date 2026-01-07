import LoginChecker from "@/components/LoginChecker";

export default function RootLayout({ children }) {
  return (
    <>
      <LoginChecker>{children}</LoginChecker>
    </>
  );
}
