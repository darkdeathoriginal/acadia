/**
 * Interpolates between two colors based on a given percentage.
 * @param {String} color1 - The first color in hexadecimal format.
 * @param {String} color2 - The second color in hexadecimal format.
 * @param {Number} percentage - The percentage of interpolation between the two colors.
 * @returns {String} The interpolated color in hexadecimal format.
 */
export function interpolateColor(color1, color2, percentage) {
  /**
   * Converts a hexadecimal color code to RGB format.
   * @param {String} hex - The hexadecimal color code.
   * @returns {Array} An array containing the RGB values [r, g, b].
   */
  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  }

  /**
   * Converts RGB values to a hexadecimal color code.
   * @param {Number} r - The red value (0-255).
   * @param {Number} g - The green value (0-255).
   * @param {Number} b - The blue value (0-255).
   * @returns {String} The hexadecimal color code.
   */
  function rgbToHex(r, g, b) {
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  }

  percentage = Math.max(0, Math.min(1, percentage));

  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const r = Math.round(r1 + (r2 - r1) * percentage);
  const g = Math.round(g1 + (g2 - g1) * percentage);
  const b = Math.round(b1 + (b2 - b1) * percentage);

  return rgbToHex(r, g, b);
}
/**
 * Fetches data from a URL with caching functionality.
 * If cached data exists and is not expired, it returns the cached data.
 * Otherwise, it fetches new data, caches it, and returns it.
 *
 * @async
 * @param {string} url - The URL to fetch data from.
 * @param {Object} [options={}] - The fetch options to be passed to the fetch function.
 * @param {string} [key] - Custom cache key. If not provided, it uses `cache_${url}`.
 * @param {Object} [config] - Configuration object for setState and cache time.
 * @param {Function} [config.setState] - Function to update state with fetched or cached data.
 * @param {number} [config.time=3600000] - Cache expiration time in milliseconds (default is 1 hour).
 * @returns {Promise<*>} The fetched or cached data.
 * @throws {Error} If there's an error in fetching or parsing the data.
 *
 * @example
 * // Basic usage
 * const data = await fetchWithCache('https://api.example.com/data');
 *
 * @example
 * // With custom options and state management
 * const data = await fetchWithCache(
 *   'https://api.example.com/data',
 *   { headers: { 'Authorization': 'Bearer token' } },
 *   'customCacheKey',
 *   {
 *     setState: (data) => setMyState(data),
 *     time: 30 * 60 * 1000 // 30 minutes
 *   }
 * );
 */

export const fetchWithCache = (
  url,
  options = {},
  key,
  { setState = (any: any) => {}, time = 60 * 60 * 1000 }
) => {
  return new Promise(async (resolve, reject) => {
    const cacheKey = key || `cache_${url}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(`${cacheKey}_time`);

    if (cachedData && cachedTime) {
      setState(JSON.parse(cachedData));
      const age = Date.now() - parseInt(cachedTime);
      if (age < time) {
        return JSON.parse(cachedData);
      }
    }

    const response = await fetch(url, options);
    const data = await response.json();
    if (data.error) {
      reject(data);
      return;
    }
    setState(data);
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

    resolve(data);
  });
};
import cookie from "js-cookie";
export function delCookie(redirection = true) {
  localStorage.clear();
  sessionStorage.clear();

  cookie.remove("token");
  cookie.remove("batch");

  if ("caches" in window) {
    caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
  }

  const nextPath = redirection ? window.location.pathname : "/attendance";
  window.location.href = "/login?redirect=" + nextPath;
}

export function parseCookieString(cookie) {
  return cookie
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[v[0]] = v[1];
      return acc;
    }, {});
}
export function fillFeedback(
  record,
  cookie,
  model,
  comment = "Good Teacher",
  remark
) {
  const data: Record<string, any> = {};
  const parsedCookie = parseCookieString(cookie);

  const remarks = [
    { name: "Average", code: "2727643000027208373" },
    { name: "Excellent", code: "2727643000027208389" },
    { name: "Good", code: "2727643000027208377" },
    { name: "Poor", code: "2727643000027208369" },
    { name: "Very Good", code: "2727643000027208385" },
  ];
  data.Academic_Year = Number(record.Academic_Year.FIELDVALUE.id);
  data.Feedback_Number = Number(record.Feedback_Number.FIELDVALUE);
  data.pkValue = record.PKVALUE;
  data.is_Completed = "zc_unchecked";
  data.Registration_Number = record.Registration_Number.FIELDVALUE.id;
  data.Section = record.Section.FIELDVALUE;
  data.plain = record.plain.FIELDVALUE;
  data.plain1 = record.plain1.FIELDVALUE;
  data.formid = model.FORMID;
  data.zccpn = parsedCookie.zccpn;
  data.recType = 3;
  data.viewLinkName = "Student_Feedback_Report";
  data.formAccessType = 3;
  data.Enter_Your_Feedback_Here_Theory = [];

  for (let i of record.Enter_Your_Feedback_Here_Theory.SUBFORM_RECORDS.slice(
    1
  )) {
    const subData: any = {};

    for (let key of Object.keys(i)) {
      const randomRemark = Math.floor(Math.random() * remarks.length);
      if (Object.keys(i[key])[0] === "FIELDVALUE" && !i[key].FIELDVALUE.id) {
        if (!remark) {
          subData[key] = remarks[randomRemark].code;
        } else {
          subData[key] = remark;
        }
      } else {
        subData[key] = i[key];
      }
    }
    subData.Comments = comment;
    subData.Course_Code = i.Course_Code.FIELDVALUE.id;
    subData.Feed_Back_ID_Bi = i.Feed_Back_ID_Bi.FIELDVALUE.id;
    subData.Registration_Number = i.Registration_Number.FIELDVALUE.id;
    subData.ID = subData.ROWID;
    subData["record::status"] = subData.RECSTATUS;
    subData["row::key"] = `t::row_${subData.SUBFORMROWNO}`;
    delete subData.RECSTATUS;
    delete subData.SUBFORMROWNO;
    data.Enter_Your_Feedback_Here_Theory.push(subData);
  }
  data.Enter_Your_Feedback_Here_Practical = [];
  for (let i of record.Enter_Your_Feedback_Here_Practical.SUBFORM_RECORDS.slice(
    1
  )) {
    const subData: any = {};
    for (let key of Object.keys(i)) {
      const randomRemark = Math.floor(Math.random() * remarks.length);
      if (Object.keys(i[key])[0] === "FIELDVALUE" && !i[key].FIELDVALUE.id) {
        if (!remark) {
          subData[key] = remarks[randomRemark].code;
        } else {
          subData[key] = remark;
        }
      } else {
        subData[key] = i[key];
      }
    }
    subData.Comments = comment;
    subData.Course_Code = i.Course_Code.FIELDVALUE.id;
    subData.Feed_Back_ID_Bi = i.Feed_Back_ID_Bi.FIELDVALUE.id;
    subData.Registration_Number = i.Registration_Number.FIELDVALUE.id;
    subData.ID = subData.ROWID;
    subData["record::status"] = subData.RECSTATUS;
    subData["row::key"] = `t::row_${subData.SUBFORMROWNO}`;
    delete subData.RECSTATUS;
    delete subData.SUBFORMROWNO;
    data.Enter_Your_Feedback_Here_Practical.push(subData);
  }
  return data;
}
