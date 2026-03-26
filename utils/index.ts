import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import cheerio from "cheerio";
import _ from "lodash";
import QueryString from "qs";
import { CookieJar } from "tough-cookie";
import {
  MOCK_TOKEN,
  mockAttendance,
  mockDayorder,
  mockMarks,
  mockPlanner,
  mockTimetable,
  mockUserDetails,
} from "./mockData";

type cookieResponse = {
  cookies: string;
  message: string;
};
const stringDeviderValue = ";;;justafakevalue;;;";

async function getXcsrfTokenFromJar(jar: CookieJar): Promise<string> {
  const cookies = await jar.getCookies("https://academia.srmist.edu.in");

  const iamcsrcoo = cookies.find((c) => c.key === "iamcsr")?.value;

  if (!iamcsrcoo) {
    throw new Error("iamcsrcoo cookie not found");
  }

  return `iamcsrcoo=${iamcsrcoo}`;
}
export async function getCookie(username, password): Promise<cookieResponse> {
  if (username === "mock@srmist.edu.in" || username === "mock") {
    return { cookies: MOCK_TOKEN, message: "" };
  }
  return new Promise(async (resolve, reject) => {
    try {
      const jar = new CookieJar();
      const client = wrapper(axios.create({ jar, withCredentials: true }));

      await client.get("https://academia.srmist.edu.in/");
      await client.get(
        "https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&orgtype=40&service_language=en&css_url=/49910842/academia-academic-services/downloadPortalCustomCss/login&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin",
      );

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
          "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data1,
      };

      const response2 = await client.request(config1);
      if (response2.data?.errors) {
        const errmessage = response2.data.localized_message || "Login failed";
        throw new Error(errmessage);
      }

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
          "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
          "Content-Type": "application/json",
        },
        data: data2,
      };
      function htmlUnescape(str) {
        return str.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
      }

      const response3 = await client.request(config2);
      if (response3.data?.errors) {
        const errmessage = response3.data.localized_message || "Login failed";
        throw new Error(htmlUnescape(errmessage));
      }
      if (response3.data?.passwordauth?.pwdpolicy) {
        return resolve({
          cookies:
            response3.data?.passwordauth?.token +
            stringDeviderValue +
            jar.getCookieStringSync("https://academia.srmist.edu.in"),
          message: response3.data?.passwordauth?.href,
        });
      }

      const redirectUrl = response3.data?.passwordauth?.redirect_uri;
      if (redirectUrl && redirectUrl.includes("block-sessions")) {
        return resolve({
          cookies: jar.getCookieStringSync("https://academia.srmist.edu.in"),
          message: "LOGIN_BLOCKED",
        });
      }
      await addAditionalCookies(client);

      const cookie = jar.getCookieStringSync("https://academia.srmist.edu.in");
      resolve({ cookies: cookie, message: "" });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
async function addAditionalCookies(client: AxiosInstance) {
  await client.get(
    "https://academia.srmist.edu.in/accounts/p/40-10002227248/preannouncement/block-sessions/next",
  );
  await client.get(
    "https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin",
  );
}
export async function forgotPassword(email: string) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, withCredentials: true }));
  await client.get("https://academia.srmist.edu.in/reset");
  await client.get(
    "https://academia.srmist.edu.in/accounts/p/10002227248/password?dcc=true&orgtype=40&serviceurl=https%3A%2F%2Facademia.srmist.edu.in&service_language=en&css_url=/49910842/academia-academic-services/downloadPortalCustomCss/reset",
  );
  const data = QueryString.stringify({
    mode: "primary",
    serviceurl: "https://academia.srmist.edu.in/",
    service_language: "en",
    orgtype: 40,
  });
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url:
      "https://academia.srmist.edu.in/accounts/p/40-10002227248/password/v2/lookup/" +
      email,
    headers: {
      "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data,
  };
  const res = await client.request(config);
  if (res.data?.errors) {
    throw new Error(res.data.localized_message || "Password reset failed");
  }
  const captcha = await getCaptcha(jar);
  return {
    identifier: res.data.lookup.identifier,
    token: res.data.lookup.token,
    cookie: jar.getCookieStringSync("https://academia.srmist.edu.in"),
    captcha,
  };
}
export async function getCaptcha(cookie: string | CookieJar) {
  const jar =
    typeof cookie === "string" ? loadJarFromCookieString(cookie) : cookie;
  const client = wrapper(axios.create({ jar, withCredentials: true }));
  const captchaConfig = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://academia.srmist.edu.in/accounts/p/40-10002227248/webclient/v1/captcha",
    headers: {
      "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: JSON.stringify({
      captcha: { digest: "undefined", usecase: "recovery" },
    }),
  };
  const captchaRes = await client.request(captchaConfig);
  if (captchaRes.data?.errors) {
    throw new Error(captchaRes.data.localized_message || "Captcha failed");
  }
  const captchaImageResp = await client.get(
    `https://academia.srmist.edu.in/accounts/p/40-10002227248/webclient/v1/captcha/${captchaRes.data.digest}?darkmode=false`,
  );
  if (captchaImageResp.data?.errors) {
    throw new Error(
      captchaImageResp.data.localized_message || "Captcha image failed",
    );
  }
  return {
    image: captchaImageResp.data.captcha.image_bytes,
    digest: captchaRes.data.digest,
  };
}

export async function verifyCaptcha(
  cookie: string,
  cdigest: string,
  captcha: string,
  token: string,
  email: string,
) {
  const jar = loadJarFromCookieString(cookie);
  const client = wrapper(axios.create({ jar, withCredentials: true }));
  const queryString = QueryString.stringify({
    serviceurl: "https://academia.srmist.edu.in/",
    service_language: "en",
    orgtype: 40,
  });
  const data = QueryString.stringify({
    captcha,
    cdigest,
    token,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `https://academia.srmist.edu.in/accounts/p/40-10002227248/password/v2/lookup/${email}/captcha?${queryString}`,
    headers: {
      "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data,
  };
  const res = await client.request(config);
  if (res.data?.errors) {
    throw new Error(
      res.data.localized_message || "Captcha verification failed",
    );
  }
  if (res.data.captchaverificationauth.length === 0) {
    throw new Error("Captcha verification failed");
  }
  return {
    jwt: res.data.captchaverificationauth[0].jwt,
    e_email:
      res.data.captchaverificationauth[0].modes.lookup_id.data[0].e_email,
  };
}
export async function sendOtp(
  cookie: string,
  jwt: string,
  e_email: string,
  email: string,
  identifier: string,
) {
  const jar = loadJarFromCookieString(cookie);
  const client = wrapper(axios.create({ jar, withCredentials: true }));
  const queryString = QueryString.stringify({
    serviceurl: "https://academia.srmist.edu.in/",
    service_language: "en",
    orgtype: 40,
  });
  const data = JSON.stringify({ emailrecoveryauth: { email_id: email } });
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `https://academia.srmist.edu.in/accounts/p/40-10002227248/password/v2/primary/${identifier}/mail/${e_email}?${queryString}`,
    headers: {
      "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
      "z-authorization": jwt,
      "Content-Type": "application/json",
    },
    data,
  };
  const res = await client.request(config);
  if (res.data?.errors) {
    throw new Error(res.data.localized_message || "Sending OTP failed");
  }
  return { success: true };
}
export async function verifyOtp(
  cookie: string,
  identifier: string,
  jwt: string,
  e_email: string,
  otp: string,
) {
  const jar = loadJarFromCookieString(cookie);
  const client = wrapper(axios.create({ jar, withCredentials: true }));
  const queryString = QueryString.stringify({
    serviceurl: "https://academia.srmist.edu.in/",
    service_language: "en",
    orgtype: 40,
  });
  const data = JSON.stringify({ emailrecoveryauth: { code: otp } });
  const config = {
    method: "put",
    maxBodyLength: Infinity,
    url: `https://academia.srmist.edu.in/accounts/p/40-10002227248/password/v2/primary/${identifier}/mail/${e_email}?${queryString}`,
    headers: {
      "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
      "z-authorization": jwt,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data,
  };
  const res = await client.request(config);
  if (res.data?.errors) {
    throw new Error(res.data.localized_message || "OTP verification failed");
  }
  return { success: true };
}

export async function changePassword(
  cookie: string,
  newPassword: string,
  identifier: string,
  jwt: string,
) {
  const jar = loadJarFromCookieString(cookie);
  const client = wrapper(axios.create({ jar, withCredentials: true }));
  const queryString = QueryString.stringify({
    cli_time: Date.now(),
    orgtype: 40,
    service_language: "en",
    serviceurl: "https://academia.srmist.edu.in",
  });
  const data = JSON.stringify({ password: { newpassword: newPassword } });
  const url = `https://academia.srmist.edu.in/accounts/p/40-10002227248/password/v2/reset/${identifier}/password?${queryString}`;
  const config = {
    method: "put",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
      "z-authorization": jwt,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data,
  };
  const res = await client.request(config);
  const resData = res.data;
  if (resData?.errors) {
    throw new Error(resData.localized_message || "Password change failed");
  }
  return { success: true };
}
export async function closeOtherSessions(
  cookie: string,
  identifier: string,
  jwt: string,
) {
  const jar = loadJarFromCookieString(cookie);
  const client = wrapper(axios.create({ jar, withCredentials: true }));
  const queryString = QueryString.stringify({
    serviceurl: "https://academia.srmist.edu.in/",
    service_language: "en",
    orgtype: 40,
  });
  const data = JSON.stringify({
    passwordsessionterminate: {
      rmwebses: true,
      rmappses: false,
      inconeauth: false,
      rmapitok: false,
    },
  });
  const config = {
    method: "put",
    maxBodyLength: Infinity,
    url: `https://academia.srmist.edu.in/accounts/p/40-10002227248/password/v2/reset/${identifier}/closesession?${queryString}`,
    headers: {
      "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
      "z-authorization": jwt,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data,
  };
  const res = await client.request(config);
  const resData = res.data;
  if (resData?.errors) {
    throw new Error(resData.localized_message || "Closing sessions failed");
  }
  return { success: true };
}

function loadJarFromCookieString(cookie: string): CookieJar {
  const jar = new CookieJar();
  cookie
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean)
    .forEach((c) => jar.setCookieSync(c, "https://academia.srmist.edu.in"));
  return jar;
}

export async function resetPassword(
  compinedCookie: string,
  newPassword: string,
  href: string,
) {
  const [token, cookie] = compinedCookie.split(stringDeviderValue);
  const queryString = QueryString.stringify({
    cli_time: Date.now(),
    orgtype: 40,
    service_language: "en",
    serviceurl:
      "https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin",
  });

  const jar = new CookieJar();
  cookie
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean)
    .forEach((c) => jar.setCookieSync(c, "https://academia.srmist.edu.in"));
  const client = wrapper(axios.create({ jar, withCredentials: true }));
  const data = JSON.stringify({
    expiry: {
      newpwd: newPassword,
    },
  });
  const base = href
    .split("/")
    .slice(0, -1)
    .join("/")
    .replace("primary", "password");
  const url = `${base}/expiry?${queryString}`;

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
      "z-authorization": `Zoho-ticket ${token}`,
      "Content-Type": "application/json",
    },
    data,
  };
  const res = await client.request(config);
  const resData = res.data;
  if (resData?.errors) {
    throw new Error(resData.localized_message || "Password reset failed");
  }
}

export async function deleteOtherSessions(cookie: string) {
  try {
    const jar = new CookieJar();
    cookie
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => jar.setCookieSync(c, "https://academia.srmist.edu.in"));

    const client = wrapper(axios.create({ jar, withCredentials: true }));
    const parsed = parseCookieString(cookie);
    const config = {
      method: "delete",
      url: "https://academia.srmist.edu.in/accounts/p/40-10002227248/webclient/v1/announcement/pre/blocksessions",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-zcsrf-token": await getXcsrfTokenFromJar(jar),
        Referer:
          "https://academia.srmist.edu.in/accounts/p/40-10002227248/preannouncement/block-sessions",
        Origin: "https://academia.srmist.edu.in",
      },
    };
    await client.request(config);

    await addAditionalCookies(client);
    return jar.getCookieStringSync("https://academia.srmist.edu.in");
  } catch (error) {
    console.error(
      "deleteOtherSessions failed:",
      error?.response?.data || error,
    );
    throw error;
  }
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
  if (cookie === MOCK_TOKEN) return mockAttendance as any;
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
      const ch = getCleanedHtml(a);
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
const uniFiedCache = {};
async function getUnifiedTimetable(url, cookie) {
  if (uniFiedCache[url]) {
    return uniFiedCache[url];
  }
  const res = await axios.request({
    method: "get",
    maxBodyLength: Infinity,
    url,
    headers: {
      Cookie: cookie,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  uniFiedCache[url] = res;
  return res;
}

const timetableCache = new Map<
  string,
  { data: Timetable; timestamp: number }
>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

export async function getTimetable(
  cookie,
  batch,
  join = true,
  regno,
  section,
): Promise<Timetable> {
  if (cookie === MOCK_TOKEN) return mockTimetable as any;
  return new Promise(async (resolve, reject) => {
    try {
      const [match, timetableResponse] = await Promise.all([
        _getCourseName(cookie),
        getUnifiedTimetable(
          `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/Unified_Time_Table_2025_` +
            (batch == "1" ? "Batch_1" : "batch_2"),
          cookie,
        ),
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
      const ch = getCleanedHtml(a);
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

      resolve(data);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
function replaceUnicodeEscapes(input) {
  return input.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
    return String.fromCharCode(parseInt(match.substr(2), 16));
  });
}
const _getCourseName = _.memoize(getCourseName);
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

      const ch = getCleanedHtml(a);
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
      console.error(error);
    }
  });
}
export async function getMarks(cookie) {
  if (cookie === MOCK_TOKEN) return mockMarks;
  return new Promise(async (resolve, reject) => {
    try {
      const [cName, timetableResponse] = await Promise.all([
        _getCourseName(cookie),
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
      const ch = getCleanedHtml(a);
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
      console.error(error);
      reject({ error: "An error occured" });
    }
  });
}
export async function getDo(cookie): Promise<string> {
  if (cookie === MOCK_TOKEN) return mockDayorder;
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
      const ch = getCleanedHtml(a);
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
  if (cookie === MOCK_TOKEN) return mockUserDetails;
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
      const ch = getCleanedHtml(a);
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
      console.error(error);
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
      console.error(error);
      reject({ error });
    }
  });
}

export const _getPlanner = _.memoize(getPlanner, (_, code) => `${code}`);

export async function getPlanner(
  cookie,
  code = "Academic_Planner_2024_25_EVEN",
) {
  if (cookie === MOCK_TOKEN) return mockPlanner;
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
          String.fromCharCode(parseInt(code, 16)),
        )
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");

      const ch = getCleanedHtml(a);
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
      console.error(error);
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
      const ch = getCleanedHtml(a);
      const tb = ch(".cntdDiv table").eq(0);
      const tr = ch("tr", tb).eq(2);
      const td = ch("td", tr).eq(3);
      const regex = /\((\w+)\sSection\)/;
      const match = regex.exec(td.text());
      const section = match[1];
      resolve(section);
    } catch (error) {
      console.error(error);
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
  params,
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
  console.log(data);

  for (let key of Object.keys(data)) {
    if (typeof data[key] === "object") {
      form.append(key, JSON.stringify(data[key]));
    } else {
      form.append(key, data[key]);
    }
  }
  const jar = loadJarFromCookieString(cookie);
  let zccpn = jar
    .getCookiesSync("https://academia.srmist.edu.in")
    .find((c) => c.key === "zccpn");
  if (zccpn) {
    form.append("zccpn", zccpn.value);
  }
  return axios.post(url, form, {
    headers: {
      Cookie: cookie,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  });
}
function getCleanedHtml(html) {
  function decodeHtml(str) {
    return str
      .replace(/\\n/g, "\n") // fix newlines
      .replace(/\\t/g, "\t") // fix tabs
      .replace(/\\-/g, "-") // fix dashes
      .replace(/\\"/g, '"') // fix escaped quotes
      .replace(/\\\//g, "/"); // fix </div>
  }

  let cleaned = decodeHtml(html);

  // decode HTML entities (&quot;, &amp;, etc.)

  // fix merged attributes: "border=" → " border="
  cleaned = cleaned.replace(/"(?=\w+=)/g, '" ');

  // remove broken <style> blocks
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");

  // optional: trim junk before first tag (extra safety)
  const firstTagIndex = cleaned.search(/<[^>]+>/);
  if (firstTagIndex !== -1) {
    cleaned = cleaned.slice(firstTagIndex);
  }

  // wrap properly so cheerio parses correctly
  return cheerio.load(`<body>${cleaned}</body>`);
}
