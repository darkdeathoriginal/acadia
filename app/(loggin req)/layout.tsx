import HandleNotice from "@/components/HandleNotice";

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      {/* <AutoChangelog /> */}
      <HandleNotice />
    </>
  );
}
