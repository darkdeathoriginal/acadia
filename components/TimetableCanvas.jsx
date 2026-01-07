// app/components/ConfigBuilder.jsx
"use client";

import { useEffect, useRef, useState } from "react";

const canvasWidth = 1920;
const canvasHeight = 1200;

// ------------- small helpers -------------
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

const days = ["0", "1", "2", "3", "4", "5"];

const emptyTimetable = days.reduce((o, d) => {
  o[d] = {};
  timing.forEach((t) => (o[d][t] = { title: "" }));
  return o;
}, {});

// ------------- component -------------
export default function ConfigBuilder() {
  // 1) The actual config the user is authoring
  const [cfg, setCfg] = useState({
    gap: 5,
    margin: 0,
    radius: 0,
    bg: "#000000",
    bg2: "",
    defaultColor: "#abb4d1",
    timeColor: "#63cdff",
    doColor: "#ff999a",
    fontColor: "#000000",
    font: "38px Arial",
    shadow: false,
    shadowColor: "rgba(0,0,0,0.5)",
    shadowOffsetX: 5,
    shadowOffsetY: 5,
    shadowBlur: 10,
    merge: false,
    isAlternate: false,
    cornertext: "TIME/DO",
  });

  // 2) headers list
  const [headers, setHeaders] = useState([
    {
      text: "TIME TABLE",
      X: 15,
      Y: 15,
      width: canvasWidth - 30,
      height: 85,
      fillStyle: "#ffffff",
      fontColor: "#000000",
      font: "bold 60px Arial",
      shadow: true,
    },
  ]);

  // 3) preview helpers
  const previewRef = useRef(null);

  const renderPreview = useCallback(() => {
    if (!previewRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");

    // quick-and-dirty render (enough to see the style)
    const rows = 6;
    const cols = 11;
    const cellWidth =
      (canvasWidth - (cfg.gap * (rows + 1) + cfg.margin * 4)) / rows;
    const cellHeight =
      (canvasHeight - cfg.margin * 4 - cfg.gap * (cols + 1)) / cols;

    // background
    ctx.fillStyle = cfg.bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    if (cfg.bg2) {
      ctx.fillStyle = cfg.bg2;
      ctx.fillRect(
        cfg.margin,
        cfg.margin,
        canvasWidth - cfg.margin * 2,
        canvasHeight - cfg.margin * 2
      );
    }

    // headers
    headers.forEach((h) => {
      ctx.fillStyle = h.fillStyle || cfg.defaultColor;
      if (cfg.shadow && h.shadow) {
        ctx.shadowColor = cfg.shadowColor;
        ctx.shadowOffsetX = cfg.shadowOffsetX;
        ctx.shadowOffsetY = cfg.shadowOffsetY;
        ctx.shadowBlur = cfg.shadowBlur;
      }
      ctx.fillRect(h.X, h.Y, h.width, h.height);
      ctx.shadowColor = "transparent";

      ctx.fillStyle = h.fontColor || cfg.fontColor;
      ctx.font = h.font || cfg.font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(h.text, h.X + h.width / 2, h.Y + h.height / 2);
    });

    // grid (just first row/col to show colors)
    const startX = cfg.gap + cfg.margin * 2;
    const startY =
      cfg.gap + cfg.margin * 2 + (headers[0]?.height || 0) + cfg.gap;

    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        let color = cfg.defaultColor;
        if (i === 0 && j === 0) color = cfg.cornertext;
        else if (i === 0) color = cfg.timeColor;
        else if (j === 0) color = cfg.doColor;
        else if (cfg.isAlternate)
          color = (i + j) % 2 === 0 ? "#ffffff" : "#f0f0f0";

        ctx.fillStyle = color;
        ctx.fillRect(
          startX + i * (cellWidth + cfg.gap),
          startY + j * (cellHeight + cfg.gap),
          cellWidth,
          cellHeight
        );
      }
    }

    // push to preview <canvas>
    const p = previewRef.current;
    p.width = canvas.width;
    p.height = canvas.height;
    p.getContext("2d").drawImage(canvas, 0, 0);
  }, [cfg, headers]);
  useEffect(() => {
    renderPreview();
  }, [renderPreview]);
  // ------------- JSON import / export -------------
  function downloadJSON() {
    const blob = new Blob([JSON.stringify({ ...cfg, headers }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-timetable-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function uploadJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setCfg(data);
        setHeaders(data.headers || []);
      } catch {
        alert("Could not parse JSON file.");
      }
    };
    reader.readAsText(file);
  }

  // ------------- dynamic header controls -------------
  function addHeader() {
    setHeaders([
      ...headers,
      {
        text: "New Header",
        X: 100,
        Y: 100,
        width: 200,
        height: 50,
        fillStyle: "#ffffff",
        fontColor: "#000000",
        font: "30px Arial",
      },
    ]);
  }

  function updateHeader(idx, field, val) {
    const h = [...headers];
    h[idx][field] = val;
    setHeaders(h);
  }

  function removeHeader(idx) {
    setHeaders(headers.filter((_, i) => i !== idx));
  }

  // ------------- UI -------------
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Timetable Config Builder</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: controls */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">1) Base settings</h2>
          {[
            ["gap", "number"],
            ["margin", "number"],
            ["radius", "number"],
            ["bg", "color"],
            ["bg2", "color"],
            ["defaultColor", "color"],
            ["timeColor", "color"],
            ["doColor", "color"],
            ["fontColor", "color"],
            ["font", "text"],
            ["shadow", "checkbox"],
            ["shadowColor", "color"],
            ["shadowOffsetX", "number"],
            ["shadowOffsetY", "number"],
            ["shadowBlur", "number"],
            ["merge", "checkbox"],
            ["isAlternate", "checkbox"],
            ["cornertext", "text"],
          ].map(([key, type]) => (
            <label key={key} className="block">
              <span className="text-sm font-medium capitalize">{key}</span>
              {type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={cfg[key]}
                  onChange={(e) => setCfg({ ...cfg, [key]: e.target.checked })}
                  className="ml-2"
                />
              ) : (
                <input
                  type={type}
                  value={cfg[key]}
                  onChange={(e) => setCfg({ ...cfg, [key]: e.target.value })}
                  className="block w-full rounded border border-gray-300 px-2 py-1"
                />
              )}
            </label>
          ))}

          <h2 className="text-xl font-semibold mt-6">2) Headers</h2>
          <button
            onClick={addHeader}
            className="bg-indigo-600 text-white px-3 py-1 rounded"
          >
            + Add header
          </button>

          {headers.map((h, idx) => (
            <div key={idx} className="border p-3 rounded space-y-2">
              <h3 className="font-medium">Header #{idx + 1}</h3>
              {[
                "text",
                "X",
                "Y",
                "width",
                "height",
                "fillStyle",
                "fontColor",
                "font",
              ].map((k) => (
                <input
                  key={k}
                  placeholder={k}
                  value={h[k]}
                  onChange={(e) => updateHeader(idx, k, e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              ))}
              <button
                onClick={() => removeHeader(idx)}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="pt-4 space-x-2">
            <button
              onClick={downloadJSON}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Download Config
            </button>
            <label className="bg-gray-600 text-white px-4 py-2 rounded cursor-pointer">
              Upload Config
              <input type="file" accept=".json" onChange={uploadJSON} hidden />
            </label>
          </div>
        </div>

        {/* RIGHT: preview */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Live preview</h2>
          <div className="overflow-auto max-h-[80vh] border rounded">
            <canvas ref={previewRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
