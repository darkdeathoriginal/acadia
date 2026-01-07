import { delCookie } from "@/utils/helpers";
import { useEffect, useState } from "react";
import useLocalStorage from "./useLocalStorage";

export default function useFetchWithCache(url, cacheKey, timeOut = 10000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cachedData, setCachedData] = useLocalStorage(cacheKey, false);

  useEffect(() => {
    if (cachedData) {
      setData(cachedData.data);
    }
    if (cachedData && Date.now() - cachedData?.timestamp < timeOut) {
      return;
    }
    setLoading(true);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        setData(data);
        setCachedData({
          data,
          timestamp: Date.now(),
        });
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [url, cachedData, cacheKey]);
  if (error == "Invalid cookie") {
    delCookie();
  }

  return { data, loading, error };
}
