import axios from "axios";
import cheerio from "cheerio";
import QueryString from "qs";

export async function getCookie(username, password): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const response1 = await axios.get("https://academia.srmist.edu.in/");
      const cookies = response1.headers["set-cookie"];
      let cookie = "";
      for (let i of cookies) {
        cookie += i.split(";")[0] + ";";
      }
      let parsedCookie = parseCookieString(cookie);
      cookie += "iamcsr" + "=" + parsedCookie.zccpn + ";";

      const data1 = QueryString.stringify({
        mode: "primary",
        servicename: "ZohoCreator",
        service_language: "en",
        serviceurl: "https://academia.srmist.edu.in/",
      });

      const config1 = {
        method: "post",
        maxBodyLength: Infinity,
        url:
          "https://academia.srmist.edu.in/accounts/p/10002227248/signin/v2/lookup/" +
          username,
        headers: {
          Origin: "https://academia.srmist.edu.in",
          Host: "academia.srmist.edu.in",
          Cookie: cookie,
          "x-zcsrf-token": `iamcsrcoo=${parsedCookie.zccpn}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data1,
      };

      const response2 = await axios.request(config1);
      if (!response2?.data?.lookup?.digest) {
        throw new Error("Invalid username");
      }

      const digest = response2.data.lookup.digest;
      const identifier = response2.data.lookup.identifier;

      const data2 = JSON.stringify({
        passwordauth: {
          password: password,
        },
      });

      const config2 = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://academia.srmist.edu.in/accounts/p/10002227248/signin/v2/primary/${identifier}/password?digest=${digest}&cli_time=1695726627526&servicename=ZohoCreator&service_language=en&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2F`,
        headers: {
          Cookie: cookie,
          "x-zcsrf-token": `iamcsrcoo=${parsedCookie.zccpn}`,
          "Content-Type": "application/json",
        },
        data: data2,
      };

      const response3 = await axios.request(config2);
      if (response3.data?.errors) {
        reject("Invalid password");
      }
      const cookies2 = response3.headers["set-cookie"];
      let cookie2 = "";
      for (let i of cookies2) {
        cookie += i.split(";")[0] + ";";
      }
      cookie2 += `CT_CSRF_TOKEN=${cookie};iamcsr=${cookie}; _zcsr_tmp=${cookie};ZCNEWUIPUBLICPORTAL=true`;
      const config3 = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin",
        headers: {
          Cookie: cookie,
          Host: "academia.srmist.edu.in",
          Referer: "https://academia.srmist.edu.in/",
        },
      };
      const response4 = await axios.request(config3);
      const cookies3 = response4.headers["set-cookie"];
      let cookie3 = "";
      for (let i of cookies3) {
        cookie += i.split(";")[0] + ";";
      }
      const parsedCookie3 = parseCookieString(cookie3);

      parsedCookie = parseCookieString(cookie);
      if (parsedCookie3.zccpn) {
        parsedCookie.zccpn = parsedCookie3.zccpn;
      }
      //covert to cookie
      cookie = "";
      for (let i of Object.keys(parsedCookie)) {
        cookie += `${i}=${parsedCookie[i]};`;
      }
      resolve(cookie);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}
type Section = {
  code: string;
  title: string;
  room: string;
  credit: string;
  category: string;
  faculty: string;
  slot: string;
  conducted: number;
  absent: number;
  percetage: string;
};

export async function getAttendance(cookie): Promise<Section[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const config3 = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance`,
        headers: {
          Cookie: cookie,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      let resp = (await axios.request(config3)).data;
      if (resp.match("Error-msg")) {
        return reject("Invalid cookie");
      }
      let a = (resp.HTML ? resp.HTML : resp)
        .split("sanitize('")[1]
        .split("');function doa")[0];
      a = a.replaceAll("\\x", "%");
      a = unescape(a);
      const ch = cheerio.load(replaceUnicodeEscapes(a));
      const article = [];
      let test = ch("div>table");
      test = ch("tbody>tr", test[2]);
      const td0 = ch("td", test[0]);
      const keys = td0
        .map(function (i, el) {
          return ch(el).text().trim();
        })
        .get();
      test = test.slice(1, test.length);
      const data = [];
      const codeIndex = keys.indexOf("Course Code");
      const titleIndex = keys.indexOf("Course Title");
      const categoryIndex = keys.indexOf("Category");
      const facultyIndex = keys.indexOf("Faculty Name");
      const slotIndex = keys.indexOf("Slot");
      const conductedIndex = keys.indexOf("Hours Conducted");
      const absentIndex = keys.indexOf("Hours Absent");
      const percentageIndex = keys.indexOf("Attn %");
      test.each(function () {
        const t = ch("td", this);
        const code = ch(t[codeIndex]).text().replace("Regular", "");

        const title = ch(t[titleIndex]).text();
        const category = ch(t[categoryIndex]).text();
        const faculty = ch(t[facultyIndex]).text().split(" (")[0];
        const slot = ch(t[slotIndex]).text();
        const conducte = ch(t[conductedIndex]).text();
        const conducted = Number(conducte);
        const absent = Number(ch(t[absentIndex]).text());
        const percetage = ch(t[percentageIndex]).text();
        const margin =
          Number(percetage) < 75
            ? Math.floor(3 * conducted - 4 * (conducted - absent)) * -1
            : Math.floor((conducted - absent) / 3 - absent);
        data.push({
          code,
          title,
          category,
          faculty,
          slot,
          conducted,
          absent,
          percetage,
          margin,
        });
      });
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}
type Period = {
  type: string;
  title: string;
  code: string;
  room: string;
  credit: string;
  category: string;
};
type Day = {
  [time: string]: Period;
};
type Timetable = {
  [day: string]: Day;
};

export async function getTimetable(
  cookie,
  batch,
  join = true,
  regno,
  section
): Promise<Timetable> {
  return new Promise(async (resolve, reject) => {
    try {
      const [match, timetableResponse] = await Promise.all([
        getCourseName(cookie),
        axios.request({
          method: "get",
          maxBodyLength: Infinity,
          url:
            `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/Unified_Time_Table_2025_` +
            (batch == "1" ? "Batch_1" : "batch_2"),
          headers: {
            Cookie: cookie,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }),
      ]);
      let resp = timetableResponse.data;
      if (resp.match("Error-msg")) {
        return reject("Invalid cookie");
      }
      let a = (resp.HTML ? resp.HTML : resp)
        .split("sanitize('")[1]
        .split("');function doa")[0];
      a = a.replaceAll("\\x", "%");
      a = unescape(a);
      const data = {
        0: {},
        1: {},
        2: {},
        3: {},
        4: {},
      };
      const data2 = {
        0: {},
        1: {},
        2: {},
        3: {},
        4: {},
      };
      const ch = cheerio.load(a);
      let test = ch("table tbody>tr");
      let f = ch("td", test[0]);
      let one = ch("td", test[3]);
      let two = ch("td", test[4]);
      let three = ch("td", test[5]);
      let four = ch("td", test[6]);
      let five = ch("td", test[7]);
      let prev;
      let time;
      const processData = (index, matchText) => {
        const slot = ch(matchText).text().split("/")[0].trim();
        const type = slot.match("P") || slot.match("L") ? "LAB" : "Theory";
        if (match[slot]) {
          data[index][time] = { ...match[slot], type };
          const isElective = match[slot].category.match(/elective/i);
          data2[index][time] = {
            type,
            title: isElective ? match[slot].category : match[slot].title,
            code: match[slot].code,
            room: isElective ? "" : match[slot].room,
            credit: match[slot].credit,
          };
        }
      };

      for (let i = 1; i < 13; i++) {
        time = ch(f[i]).text().replace("\t", "");

        processData(0, one[i]);
        processData(1, two[i]);
        processData(2, three[i]);
        processData(3, four[i]);
        processData(4, five[i]);

        prev = time;
      }

      // if (section && regno) {
      //   try {
      //     await Promise.race([
      //       updateTimetable(data2, regno, section),
      //       new Promise((resolve, reject) =>
      //         setTimeout(() => {
      //           console.log("tm Timed out");
      //           resolve(0);
      //         }, 1000)
      //       ),
      //     ]);
      //   } catch (error) {}
      // }
      resolve(data);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}
export async function updateTimetable(timetable, regno, section) {
  try {
    const url = "http://135.119.198.251:8080/table";
    const { data } = await axios.post(url, { timetable, regno, section });
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}
function replaceUnicodeEscapes(input) {
  return input.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
    return String.fromCharCode(parseInt(match.substr(2), 16));
  });
}
export async function getCourseName(cookie, c = false) {
  return new Promise(async (resolve, reject) => {
    const url = c
      ? "https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance"
      : "https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Time_Table_2023_24";
    try {
      const config3 = {
        method: "get",
        maxBodyLength: Infinity,
        url,
        headers: {
          Cookie: cookie,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      let resp = (await axios.request(config3)).data;
      if (resp.match("Error-msg")) {
        return resolve({ error: "Invalid cookie" });
      }
      let a = (resp.HTML ? resp.HTML : resp)
        .split("sanitize('")[1]
        .split("');function doa")[0];
      a = a.replaceAll("\\x", "%");
      a = unescape(a);
      const data = {};

      const ch = cheerio.load(replaceUnicodeEscapes(a));
      if (c) {
        let test = ch("div>table");
        test = ch("tbody>tr", test[2]);
        test = test.slice(1, test.length);
        test.each(function () {
          const t = ch("td", this);
          const code = ch(t[0]).text().replace("Regular", "");
          const title = ch(t[1]).text();
          data[code] = { title };
        });
        resolve(data);
        return;
      }
      const tb = ch("table>tbody");
      let tr = ch("tr", tb[1]);
      const td0 = ch("td", tr[0]);
      const keys = td0
        .map(function (i, el) {
          return ch(el).text().trim();
        })
        .get();
      const titleIndex = keys.indexOf("Course Title");
      const codeIndex = keys.indexOf("Course Code");
      const slotIndex = keys.indexOf("Slot");
      const creditIndex = keys.indexOf("Credit");
      const categoryIndex = keys.indexOf("Category");
      const roomIndex = keys.indexOf("Room No.");
      tr.each(function () {
        const td = ch("td", this);
        const title = ch(td[titleIndex]).text();

        const code = ch(td[codeIndex]).text();
        const slot = ch(td[slotIndex]).text().split("-");
        const credit = ch(td[creditIndex]).text();
        const category = ch(td[categoryIndex]).text();
        const room = ch(td[roomIndex]).text().trim();
        slot.map((e) => {
          let type = e.match("P") ? "LAB" : "Theory";
          if (e) {
            data[e] = { title, code, type, credit, room, category };
            data[code] = { title, code, type, credit, room, category };
          }
        });
      });
      resolve(data);
    } catch (error) {
      console.log(error);
    }
  });
}
export async function getMarks(cookie) {
  return new Promise(async (resolve, reject) => {
    try {
      const [cName, timetableResponse] = await Promise.all([
        getCourseName(cookie),
        axios.request({
          method: "get",
          maxBodyLength: Infinity,
          url: `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance`,
          headers: {
            Cookie: cookie,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }),
      ]);
      let resp = timetableResponse.data;
      if (resp.match("Error-msg")) {
        return resolve({ error: "Invalid cookie" });
      }
      let a = (resp.HTML ? resp.HTML : resp)
        .split("sanitize('")[1]
        .split("');function doa")[0];
      a = a.replaceAll("\\x", "%");
      a = unescape(a);
      const data = [];
      const ch = cheerio.load(a);
      const table = ch(".cntdDiv>div>table").eq(3);
      let trs = ch("tr", table);
      trs = trs.slice(1, trs.length - 1);
      trs.each(function () {
        const tds = ch("td", this);
        const code = ch(tds[0]).text();
        const type = ch(tds[1]).text();
        const mtds = ch("tr>td", tds[2]);
        const marks = [];
        if (type == "Theory" || type == "Practical") {
          let totalmarks = 0;
          let totalobtained = 0;
          mtds.each(function () {
            const name = ch("strong", this).text().split("/")[0];
            const mark = ch(this).text().split(ch("strong", this).text())[1];
            const total = ch("strong", this).text().split("/")[1];
            totalmarks += Number(total);
            totalobtained += isNaN(Number(mark)) ? 0 : Number(mark);
            marks.push({ name, mark, total });
          });
          data.push({
            name: cName[code]?.title,
            code,
            type,
            marks,
            credit: cName[code]?.credit,
            total:
              totalmarks > 0
                ? totalobtained.toFixed(2) + "/" + totalmarks
                : null,
          });
        }
      });
      resolve(data);
    } catch (error) {
      console.log(error);
      reject({ error: "An error occured" });
    }
  });
}
export async function getDo(cookie): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const config3 = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/WELCOME`,
        headers: {
          Cookie: cookie,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      let resp = (await axios.request(config3)).data;
      if (resp.match("Error-msg")) {
        return reject("Invalid cookie");
      }
      let a = (resp.HTML ? resp.HTML : resp)
        .split("sanitize('")[1]
        .split("');function doa")[0];
      a = a.replaceAll("\\x", "%");
      a = unescape(a);
      const ch = cheerio.load(a);
      const f = ch(`strong font[color="yellow"]`);
      const dayorder = ch(f[1]).text().split(":")[1];
      resolve(dayorder);
    } catch (error) {
      reject(error);
    }
  });
}
type UserDetails = {
  roll: string;
  name: string;
  program: string;
  department: string;
  specialisation: string;
  semester: string;
  batch: string;
  section: string;
};
export async function getUserDetails(cookie): Promise<UserDetails> {
  return new Promise(async (resolve, reject) => {
    try {
      const [section, timetableResponse] = await Promise.all([
        getSection(cookie),
        axios.request({
          method: "get",
          maxBodyLength: Infinity,
          url: `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance`,
          headers: {
            Cookie: cookie,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }),
      ]);

      // const timetableResponse = await axios.request({
      //   method: "get",
      //   maxBodyLength: Infinity,
      //   url: `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance`,
      //   headers: {
      //     Cookie: cookie,
      //     "Content-Type": "application/x-www-form-urlencoded",
      //   },
      // })
      let resp = timetableResponse.data;
      if (resp.match("Error-msg")) {
        return reject("Invalid cookie");
      }
      let a = (resp.HTML ? resp.HTML : resp)
        .split("sanitize('")[1]
        .split("');function doa")[0];
      a = a.replaceAll("\\x", "%");
      a = unescape(a);
      const ch = cheerio.load(a);
      const table = ch(".cntdDiv>div>table");
      const trs = ch("tr", table[1]);
      const roll = ch(ch("td", trs[0])[1]).text();
      const name = ch(ch("td", trs[1])[1]).text();
      const program = ch(ch("td", trs[2])[1]).text();
      const department = ch(ch("td", trs[3])[1]).text();
      const specialisation = ch(ch("td", trs[4])[1]).text();
      const semester = ch(ch("td", trs[5])[1]).text();
      const batch = ch(ch("td", trs[5])[4]).text();
      resolve({
        roll,
        name,
        program,
        department,
        specialisation,
        semester,
        batch,
        section: section as string,
      });
    } catch (error) {
      console.log(error);
      reject({ error: "User not found" });
    }
  });
}

export function getCodes(cookie) {
  return new Promise(async (resolve, reject) => {
    try {
      const url = "https://academia.srmist.edu.in/";
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url,
        headers: {
          Cookie: cookie,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      let resp = (await axios.request(config)).data;
      const $ = cheerio.load(resp);
      let codeObject = null;

      $("script").each((index, element) => {
        const scriptContent = $(element).html();

        if (scriptContent) {
          const regex = /var\s+code\s*=\s*(\{[\s\S]*?\})\s*;/;
          const match = scriptContent.match(regex);

          if (match && match[1]) {
            const objectString = match[1];
            try {
              const func = new Function(`return ${objectString};`);
              codeObject = func();
              return false;
            } catch (e) {
              console.error("Error parsing the extracted code string:", e);
              console.error("Problematic string:", objectString);
            }
          }
        }
      });

      resolve(codeObject);
    } catch (error) {
      console.log(error);
      reject({ error });
    }
  });
}

export async function getPlanner(
  cookie,
  code = "Academic_Planner_2024_25_EVEN"
) {
  if (!code) {
    code = "Academic_Planner_2024_25_EVEN";
  }
  return new Promise(async (resolve, reject) => {
    try {
      const config3 = {
        method: "get",
        maxBodyLength: Infinity,
        url:
          `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/` +
          code,
        headers: {
          Cookie: cookie,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      let resp = (await axios.request(config3)).data;
      if (resp.match("Error-msg")) {
        return resolve({ error: "Invalid cookie" });
      }
      let tmp = resp.HTML ? resp.HTML : resp;
      let a = tmp;
      const isZm = tmp.match("zmlvalue");
      if (isZm) {
        a = tmp.split('zmlvalue="')[1].split('"></div>')[0];
      }

      a = a
        .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
          String.fromCharCode(parseInt(code, 16))
        )
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");

      const ch = cheerio.load(a);
      const tbodys = ch(".mainDiv tbody");
      const tbody = isZm ? tbodys[0] : tbodys[1];
      const trs = ch("tr", tbody);
      const data = {};
      const monthHeader = ch("th", tbody);

      trs.each(function (index, element) {
        const tds = ch("td", element);

        for (let i = 0; i < tds.length; i += 5) {
          const month = ch(monthHeader[i + 2]).text();
          data[month] = data[month] || [];

          const date = ch(tds[i]).text();
          const day = ch(tds[i + 1]).text();
          const sp = ch(tds[i + 2]).text();
          const dayo = ch(tds[i + 3]).text();
          if (date) {
            data[month].push({ date, day, sp, dayo });
          }
        }
      });
      resolve(data);
    } catch (error) {
      console.log(error);
      resolve({ error: "An error occured" });
    }
  });
}
export async function getSection(cookie) {
  return new Promise(async (resolve, reject) => {
    try {
      const config3 = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Time_Table_2023_24`,
        headers: {
          Cookie: cookie,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      let resp = (await axios.request(config3)).data;
      if (resp.match("Error-msg")) {
        return resolve({ error: "Invalid cookie" });
      }
      let a = (resp.HTML ? resp.HTML : resp)
        .split("sanitize('")[1]
        .split("');function doa")[0];
      a = a.replaceAll("\\x", "%");
      a = unescape(a);
      const data = {};
      const ch = cheerio.load(a);
      const tb = ch(".cntdDiv table").eq(0);
      const tr = ch("tr", tb).eq(2);
      const td = ch("td", tr).eq(3);
      const regex = /\((\w+)\sSection\)/;
      const match = regex.exec(td.text());
      const section = match[1];
      resolve(section);
    } catch (error) {
      console.log(error);
    }
  });
}

export async function getFeedbackParams(cookie): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const url =
        "https://academia.srmist.edu.in/srm_university/academia-academic-services/page/Feedback_Polling_Page_2016_17";
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url,
        headers: {
          Cookie: cookie,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      let resp = (await axios.request(config)).data;
      let a = (resp.HTML ? resp.HTML : resp)
        .split("sanitize('")[1]
        .split("');function doa")[0];
      a = a.replaceAll("\\x", "%");
      a = unescape(a);
      if (a.match("already completed")) {
        return reject("Feedback already completed");
      }
      const $ = cheerio.load(a);
      const params = $("div").attr("params");
      resolve(params);
    } catch (error) {
      reject(error);
    }
  });
}
export async function getFeedbackCompletion(
  cookie,
  params
): Promise<{
  isCompleted: boolean;
  data: any;
}> {
  return new Promise(async (resolve, reject) => {
    try {
      const url =
        "https://academia.srmist.edu.in/srm_university/academia-academic-services/form/Student_Feedback_Form";
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url,
        headers: {
          Cookie: cookie,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: params,
      };
      let resp = (await axios.request(config)).data;
      resolve({
        isCompleted: JSON.parse(resp?.RECORD?.is_Completed?.FIELDVALUE),
        data: resp,
      });
    } catch (error) {
      reject(error);
    }
  });
}
function parseCookieString(cookie) {
  return cookie
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[v[0]] = v[1];
      return acc;
    }, {});
}
export function submitFeedback(data, cookie) {
  const url =
    "https://academia.srmist.edu.in/srm_university/academia-academic-services/form/Student_Feedback_Form/edit";
  const form = new FormData();
  for (let key of Object.keys(data)) {
    if (typeof data[key] === "object") {
      form.append(key, JSON.stringify(data[key]));
    } else {
      form.append(key, data[key]);
    }
  }
  const cookieObj = parseCookieString(cookie);
  return axios.post(url, form, {
    headers: {
      Cookie: cookie,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  });
}
