import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import { getSeen, setSeen } from "../services/storage.js";

export function useGuide(storageKey, steps) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [layout, setLayout] = useState(null);
  const refs = useRef(steps.map(() => null));
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    let cancelled = false;
    getSeen(storageKey).then((alreadySeen) => {
      if (!cancelled && !alreadySeen) setActive(true);
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const bindRef = useCallback((i) => (node) => {
    refs.current[i] = node;
  }, []);

  useEffect(() => {
    if (!active) return;
    const node = refs.current[index];
    if (!node) return;
    let raf = null;
    const measure = () => {
      node.measureInWindow((x, y, w, h) => {
        setLayout({ x, y, width: w, height: h });
      });
    };
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(measure);
    }, 120);
    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active, index, width, height]);

  const close = useCallback(() => {
    setActive(false);
    setSeen(storageKey);
  }, [storageKey]);

  const next = useCallback(() => {
    if (index < steps.length - 1) {
      setIndex((i) => i + 1);
      setLayout(null);
    } else {
      close();
    }
  }, [index, steps.length, close]);

  return {
    visible: active && !!layout,
    index,
    total: steps.length,
    layout,
    bindRef,
    next,
    skip: close,
  };
}