import { useEffect, useState } from "react";

const PREFIX = "codepencil";

type InitialValueType = string | number | number[] | (() => void);

const useLocalStorage = (key: string, initialValue: InitialValueType) => {
  const prefixedkey = PREFIX + key;
  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(prefixedkey);
    if (jsonValue) return JSON.parse(jsonValue);
    if (typeof initialValue === "function") {
      return initialValue();
    } else {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(prefixedkey, JSON.stringify(value));
  }, [value, prefixedkey]);
  return [value, setValue];
};

export default useLocalStorage;
