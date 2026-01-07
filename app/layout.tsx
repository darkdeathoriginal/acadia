import Service from "@/components/serviceRegister";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: "#000",
};

export const metadata = {
  title: "Acadia",
  description:
    "Acadia is a web app that helps students to get their academic details like attendance, marks, timetable etc. It is a simple and easy way to get academic details for SRMIST students. It is a student project and not affiliated with SRMIST.",
  manifest: "/manifest.json",
  startUrl: "/",
  lang: "en",
  keywords: [
    "Academia",
    "Acadia",
    "Attendance",
    "mark",
    "SRM",
    "SRMIST",
    "SRM University",
    "SRMIST University",
    "SRMIST Academia",
    "srm",
    "acadia srm",
    "srm acadia",
    "srmist acadia",
  ],
};
const isDev = process.env.NODE_ENV === "development";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className + "relative"}>
        <Service />
        {children}
      </body>
    </html>
  );
}
