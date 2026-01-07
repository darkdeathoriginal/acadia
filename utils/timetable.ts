const canvasWidth = 1920;
const canvasHeight = 1200;

const timing = [
  "08:00 - 08:50",
  "08:50 - 09:40",
  "09:45 - 10:35",
  "10:40 - 11:30",
  "11:35 - 12:25",
  "12:30 - 01:20",
  "01:25 - 02:15",
  "02:20 - 03:10",
  "03:10 - 04:00",
  "04:00 - 04:50",
  "04:50 - 05:30",
  "05:30 - 06:10",
];

export function generateTimetable(
  tm,
  section,
  variant,
  download = false,
  room = ""
) {
  const rows = 6;
  let cols = 11;
  const v = variantFunctions[variant];
  const result = checkTimetable(tm);
  if (result === 2) {
    cols = 13;
  } else if (result === 1) {
    cols = 12;
  } else {
    cols = 11;
  }
  const canvas = v(tm, section, room, { rows, cols });
  if (download) {
    var link = document.createElement("a");
    link.setAttribute("download", `timetable-${variant}.png`);
    link.setAttribute(
      "href",
      canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
    );
    link.click();
    return;
  }
  return canvas;
}
function isUpperCase(character) {
  if (!character) return false;
  return character === character?.toUpperCase();
}
function drawRoundedRect(
  ctx,
  x,
  y,
  width,
  height,
  radius,
  fillStyle,
  text,
  options = {
    font: "38px Arial",
    fontColor: "black",
    shadow: false,
    shadowColor: "",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
  }
) {
  // Add another shadow effect

  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
  // Draw rounded rectangle with shadow
  if (options.shadow) {
    ctx.shadowColor = options.shadowColor || "rgba(0, 0, 0, 1)"; // Shadow color
    ctx.shadowOffsetX = options.shadowOffsetX || 5; // Horizontal shadow offset
    ctx.shadowOffsetY = options.shadowOffsetY || 5; // Vertical shadow offset
    ctx.shadowBlur = options.shadowBlur || 10; // Shadow blur radius
  }
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();

  // Reset shadow properties (if necessary)
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;

  // Draw text
  ctx.fillStyle = options.fontColor || "black";
  ctx.font = options.font || "38px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + width / 2, y + height / 2);
}
function checkTimetable(data) {
  let hasAbove450 = false;
  let hasAbove530 = false;

  // Iterate over each day
  Object.values(data).forEach((day) => {
    // Iterate over each time slot
    Object.keys(day).forEach((slot) => {
      // Extract the end time from the time slot
      const endTime = slot.split(" - ")[1];
      if (endTime === "05:30") {
        hasAbove450 = true;
      }
      if (endTime === "06:10") {
        hasAbove530 = true;
      }
    });
  });

  if (hasAbove530) {
    return 2;
  } else if (hasAbove450) {
    return 1;
  } else {
    return 0;
  }
}
const v1Config = {
  gap: 5,
  bg: "black",
  defaultColor: "#abb4d1",
  timeColor: "#63cdff",
  doColor: "#ff999a",
};

function renderTimetable(tm, section = "", room, { rows, cols }, config) {
  const gap = config.gap || 5;
  const radius = config.radius || 0;
  const bg = config.bg || "black";
  const offset = config.offset || 0;
  const margin = config.margin || 0;
  const startingj = gap + offset + margin * 2;
  const startingx = gap + margin * 2;
  const merge = config.merge || false;
  const fontColor = config.fontColor || "black";
  let font = config.font || "38px Arial";
  const shadowColor = config.shadowColor;
  const shadow = config.shadow || false;
  const shadowOffsetX = config.shadowOffsetX;
  const shadowOffsetY = config.shadowOffsetY;
  const shadowBlur = config.shadowBlur;
  const cellWidth = (canvasWidth - (gap * (rows + 1) + margin * 4)) / rows;
  const cellHeight =
    (canvasHeight - margin * 4 - offset - gap * (cols + 1)) / cols;

  const canvas = document.createElement("canvas");
  canvas.height = canvasHeight;
  canvas.width = canvasWidth;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bg;
  drawRoundedRect(ctx, 0, 0, canvasWidth, canvasHeight, radius, bg, "", {
    fontColor,
    font,
    shadowColor,
    shadow,
    shadowOffsetX,
    shadowOffsetY,
    shadowBlur,
  });
  if (config.bg2) {
    drawRoundedRect(
      ctx,
      margin,
      margin,
      canvasWidth - margin * 2,
      canvasHeight - margin * 2,
      radius,
      config.bg2,
      ""
    );
  }
  let k = 0;
  const parameter = {
    ...config,
    cellWidth,
    cellHeight,
    startingx,
    startingj,
    margin,
    gap,
    rows,
    cols,
    canvasWidth,
    canvasHeight,
    section,
    room,
  };
  function handleIfFunction(value) {
    return typeof value === "function" ? value(parameter) : value;
  }
  for (const header of config.headers || []) {
    drawRoundedRect(
      ctx,
      handleIfFunction(header.X),
      handleIfFunction(header.Y),
      handleIfFunction(header.width),
      handleIfFunction(header.height),
      radius,
      header.fillStyle || config.defaultColor,
      handleIfFunction(header.text) || "",
      {
        fontColor: header.fontColor || fontColor,
        font: header.font || font,
        shadow: header.shadow || shadow,
        shadowColor: header.shadowColor || shadowColor,
        shadowOffsetX: header.shadowOffsetX || shadowOffsetX,
        shadowOffsetY: header.shadowOffsetY || shadowOffsetY,
        shadowBlur: header.shadowBlur || shadowBlur,
      }
    );
  }
  for (
    let i = startingx, k = 0, l = -1;
    i < canvasWidth - (margin * 2 + gap * (rows + 1));
    i += cellWidth
  ) {
    let l = -2;
    for (
      let j = startingj;
      j <= cellHeight * cols + startingj + gap * cols - 1;
      j += cellHeight
    ) {
      let fillStyle = config.defaultColor || "#abb4d1";
      let text = "";
      font = config.font || "38px Arial";

      l++;
      const todayTm = tm[`${k - 1}`];

      const currentTm = timing[l];
      const nextTm = timing[l + 1];
      let isSub = false;
      if (i === startingx && j !== startingj) {
        fillStyle = config.timeColor || "#63cdff";
        text = timing[l];
      } else if (i !== startingx && j === startingj) {
        fillStyle = config.doColor || "#ff999a";
        text = `DO ${k}`;
      } else if (i === startingx && j === startingj) {
        text = config.cornertext || section;
      } else {
        if (todayTm && todayTm[currentTm]) {
          text = todayTm[currentTm]?.title;
          if (text.match(":")) {
            text = text.split(":")[0];
          } else {
            text = text
              .split(" ")
              .map((t) => {
                if (isUpperCase(t[0])) {
                  return t[0];
                }
                return "";
              })
              .join("");
          }
        }
        if (todayTm && todayTm[nextTm]) {
          let temp = todayTm[nextTm]?.title;
          if (temp.match(":")) {
            temp = temp.split(":")[0];
          } else {
            temp = temp
              .split(" ")
              .map((t) => {
                if (isUpperCase(t[0])) {
                  return t[0];
                }
                return "";
              })
              .join("");
          }
          isSub = temp === text;
        }
      }
      if (config.isAlternate) {
        console.log(l, text);

        fillStyle = config.alternate(l);
      }
      font = config.rowFont && l == -1 ? config.rowFont : font;
      font = config.colFont && k == 0 ? config.colFont : font;
      if (isSub && merge) {
        drawRoundedRect(
          ctx,
          i,
          j,
          cellWidth,
          cellHeight * 2 + gap,
          radius,
          fillStyle,
          text,
          {
            shadow,
            fontColor,
            font,
            shadowColor,
            shadowOffsetX,
            shadowOffsetY,
            shadowBlur,
          }
        );
        j += (canvasHeight - offset - gap * (cols + 1)) / cols;
        l++;
        j += gap;
      } else {
        drawRoundedRect(
          ctx,
          i,
          j,
          cellWidth,
          cellHeight,
          radius,
          fillStyle,
          text,
          {
            shadow,
            fontColor,
            font,
            shadowColor,
            shadowOffsetX,
            shadowOffsetY,
            shadowBlur,
          }
        );
      }
      j += gap;
    }
    i += gap;
    k++;
  }

  return canvas;
}
const v1 = (tm, section = "", room, { rows, cols }) => {
  const config = v1Config;
  return renderTimetable(tm, section, room, { rows, cols }, config);
};
const v2Config = {
  gap: 15,
  bg: "white",
  defaultColor: "#abb4d1",
  timeColor: "#63cdff",
  doColor: "#ff999a",
  radius: 10,
  offset: 100,
  shadow: true,
  shadowColor: "rgba(0, 0, 0, 0.5)",
  merge: true,
  headers: [
    {
      text: "TIME TABLE",
      X: 15,
      Y: 15,
      width: canvasWidth - 15 * 2,
      height: 100 - 15,
      shadow: true,
    },
  ],
};
const v2 = (tm, section = "", room, { rows, cols }) => {
  const config = v2Config;
  return renderTimetable(tm, section, room, { rows, cols }, config);
};
const v3Config = {
  ...v2Config,
  bg: "#151517",
  defaultColor: "#151517",
  timeColor: "#27272b",
  doColor: "#27272b",
  fontColor: "white",
  shadowColor: "rgba(255, 255, 255, 0.3)",
  shadowOffsetX: -3,
  shadowOffsetY: -3,
  shadowBlur: 5,
};
const v3 = (tm, section = "", room, { rows, cols }) => {
  const config = v3Config;
  return renderTimetable(tm, section, room, { rows, cols }, config);
};
const v4Config = {
  margin: 50,
  bg: "#345C73",
  bg2: "#2A2E31",
  radius: 10,
  offset: 225,
  gap: 15,
  doColor: "#FE9E7A",
  isAlternate: true,
  alternate: (index) => {
    if (index == -1) return "#FE9E7A";
    return index % 2 === 0 ? "#D3EDF4" : "white";
  },
  font: "30px Arial",
  rowFont: "bold 30px Arial",
  colFont: "bold 30px Arial",
  cornertext: "TIME/DO",
  headers: [
    {
      text: "CLASS SCHEDULE",
      X: (e) => {
        return e.margin * 2 + e.cellWidth * 2 + e.gap * 3;
      },
      Y: 100,
      width: (e) => e.cellWidth * 4 + 15 * 3,
      height: 225 - (50 - 15),
      fillStyle: "white",
      font: " bold 120px Arial",
      fontColor: "#2A2E31",
      shadow: true,
      shadowColor: "rgba(0, 0, 0, 0.5)",
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 10,
    },
    {
      text: "SECTION",
      X: (e) => e.startingx,
      Y: (e) => e.startingj - e.cellHeight * 3 - e.gap * 3 - e.gap / 2,
      width: (e) => e.cellWidth,
      height: (e) => e.cellHeight,
      fillStyle: "#FE9E7A",
      font: "bold 30px Arial",
      fontColor: "#2A2E31",
      shadow: false,
    },
    {
      text: "ROOM",
      X: (e) => e.startingx,
      Y: (e) => e.startingj - e.cellHeight * 2 - e.gap * 2 + e.gap / 2,
      width: (e) => e.cellWidth,
      height: (e) => e.cellHeight,
      fillStyle: "#FE9E7A",
      font: "bold 30px Arial",
      fontColor: "#2A2E31",
      shadow: false,
    },
    {
      text: (e) => e.section,
      X: (e) => e.startingx + e.cellWidth + e.gap,
      Y: (e) => e.startingj - e.cellHeight * 3 - e.gap * 3 - e.gap / 2,
      width: (e) => e.cellWidth,
      height: (e) => e.cellHeight,
      fillStyle: "#D3EDF4",
      font: "30px Arial",
      fontColor: "#2A2E31",
      shadow: false,
    },
    {
      text: (e) => e.room,
      X: (e) => e.startingx + e.cellWidth + e.gap,
      Y: (e) => e.startingj - e.cellHeight * 2 - e.gap * 2 + e.gap / 2,
      width: (e) => e.cellWidth,
      height: (e) => e.cellHeight,
      fillStyle: "#D3EDF4",
      font: "30px Arial",
      fontColor: "#2A2E31",
      shadow: false,
    },
  ],
};
const v4 = (tm, section = "", room, { rows, cols }) => {
  const config = v4Config;
  return renderTimetable(tm, section, room, { rows, cols }, config);
};
const variantFunctions = {
  v1,
  v2,
  v3,
  v4,
};
export const variants = Object.keys(variantFunctions);
