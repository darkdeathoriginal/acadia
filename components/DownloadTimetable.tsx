import { delCookie, fetchWithCache } from "@/utils/helpers";
import { generateTimetable, variants } from "@/utils/timetable";
import { Download } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import HorizontalScroll from "./HorizontalScroll";
import CustomModal from "./Modal";
import Spinner from "./spinner";

export default function DownloadTimetable({ timetable, section = "" }) {
  const icon = <Download className="" />;
  const [temp, setTemp] = useState(icon);
  const [user, setUser] = useState({ section });
  const [showModal, setShowModal] = useState(false);
  const [position, setPosition] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [room, setRoom] = useState("");
  const handleClick = async () => {
    setTemp(<Spinner text={""} />);
    if (!user.section) {
      new Promise(async (resolve, reject) => {
        try {
          await fetchWithCache(
            "/api/user",
            {
              cache: "no-store",
              next: { revalidate: 1 },
            },
            "cache_user",
            { setState: setUser }
          );
        } catch (error) {
          if (error?.error == "Invalid cookie") {
            delCookie();
          }
        } finally {
          resolve(0);
        }
      });
    }
    setRoom(getMostCommonRoom(timetable));
    setTemp(icon);
    setShowModal(true);
    return;
  };
  return (
    <div className="cursor-pointer" title="download timetable">
      <div onClick={() => handleClick()}>{temp}</div>
      {user && timetable && (
        <CustomModal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          {showModal && (
            <div className="flex flex-col gap-3 items-center">
              <HorizontalScroll
                elements={variants.map((v, i) => {
                  return (
                    <CreateCanvas
                      user={user}
                      timetable={timetable}
                      variant={v}
                      room={room}
                      key={i}
                    />
                  );
                })}
                position={position}
                setPercentage={setPercentage}
                setPosition={setPosition}
                updatePosition={true}
              />
              <div className="flex gap-3">
                <button
                  className="p-2 bg-red-400 hidden lg:block rounded-md"
                  onClick={() => {
                    setShowModal(false);
                  }}
                >
                  Close
                </button>
                <button
                  className="p-2 bg-blue-400 rounded-md"
                  onClick={() => {
                    generateTimetable(
                      timetable,
                      user.section,
                      variants[position],
                      true,
                      room
                    );
                  }}
                >
                  download
                </button>
              </div>
            </div>
          )}
        </CustomModal>
      )}
    </div>
  );
}
function CreateCanvas({ user, timetable, variant, room }) {
  const canvasRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  useEffect(() => {
    const canvas = generateTimetable(
      timetable,
      user.section,
      variant,
      false,
      room
    );
    canvas.className = "w-[100%] lg:w-[60%] object-contain";
    canvasRef.current.replaceChildren(canvas);
    setIsRendered(true);
  }, [room, timetable, user, variant]);
  return (
    <div
      ref={canvasRef}
      className=" p-1 flex flex-col items-center justify-center"
    ></div>
  );
}
function getMostCommonRoom(data) {
  const roomCounts = {};

  Object.values(data).forEach((day) => {
    Object.values(day).forEach((slot) => {
      const room = slot.room;
      if (!room) return;
      roomCounts[room] = (roomCounts[room] || 0) + 1;
    });
  });

  let mostCommonRoom;
  let maxCount = 0;
  Object.entries(roomCounts).forEach(([room, count]: [string, number]) => {
    if (count > maxCount) {
      mostCommonRoom = room;
      maxCount = count;
    }
  });

  return mostCommonRoom;
}
