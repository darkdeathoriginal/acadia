import Header from "@/components/Header";
import Timetable from "@/components/Timetable";

export const metadata = {
  title: "Timetable | Acadia",
  description:
    "Check your timetable with ease. Simple and easy way to get academic details.",
  keywords: [
    "Timetable",
    "Academia",
    "SRMIST",
    "SRM",
    "SRMIST Academia",
    "srm",
    "acadia srm",
    "srm acadia",
    "srmist acadia",
    "srmist timetable",
    "srm timetable",
    "acadia timetable",
    "timetable srmist",
    "timetable srm",
    "timetable acadia",
  ],
};

export default async function page() {
  let data = true;
  return (
    <div>
      <Header title={"🗓️Timetable"} />
      <div className="text-white">
        {data ? (
          <Timetable tm={false} section={null} />
        ) : (
          <h3 className="text-red-600 text-xl">
            An error occured. Please refresh the page
          </h3>
        )}
      </div>
    </div>
  );
}
