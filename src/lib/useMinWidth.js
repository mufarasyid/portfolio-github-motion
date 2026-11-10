import { useEffect, useRef, useState } from "react";

export default function useMinWidth(minWidth) {
  const ref = useRef(null);
  const [width, setWidth] = useState(minWidth);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(minWidth, el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [minWidth]);

  return [ref, width];
}
