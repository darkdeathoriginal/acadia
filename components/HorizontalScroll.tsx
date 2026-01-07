import React, { useCallback, useEffect, useRef } from "react";

export default function HorizontalScroll({
  elements,
  position,
  setPosition,
  setPercentage,
  updatePosition = false,
}) {
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const elementsRef = useRef([]);

  const scrollToRef = (ref, behavior = "smooth") => {
    if (!containerRef.current || !ref) return;
    containerRef.current.scrollTo({
      left: ref.offsetLeft,
      behavior,
    });
  };
  const callbackedSetPercentage = useCallback(
    (percentage) => {
      setPercentage(percentage);
    },
    [setPercentage]
  );
  const callbackedSetPosition = useCallback(
    (position) => {
      setPosition(position);
    },
    [setPosition]
  );
  useEffect(() => {
    const snapScroll = () => {
      const containerScrollLeft = containerRef.current.scrollLeft;
      const distances = elementsRef.current.map((ref) =>
        Math.abs(containerScrollLeft - (ref?.offsetLeft || 0))
      );
      const min = Math.min(...distances);
      if (min < 0.5) {
        const closestIndex = distances.indexOf(min);
        callbackedSetPosition(closestIndex);
        return;
      }
    };

    const handleScroll = () => {
      if (!containerRef.current) return;

      const containerScrollLeft = containerRef.current.scrollLeft;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      const containerScrollWidth = containerRef.current.scrollWidth;
      const containerClientWidth = containerRef.current.clientWidth;

      const percentageScrolled =
        (containerScrollLeft / (containerScrollWidth - containerClientWidth)) *
        100;
      callbackedSetPercentage(percentageScrolled);
      scrollTimeoutRef.current = setTimeout(() => snapScroll(), 300);
    };

    const refrerence = containerRef.current;
    refrerence.addEventListener("scroll", handleScroll);
    return () => {
      refrerence?.removeEventListener("scroll", handleScroll);
    };
  }, [callbackedSetPercentage, callbackedSetPosition]);

  useEffect(() => {
    if (updatePosition) return;
    scrollToRef(elementsRef.current[position || 0], "instant");
  }, [position, updatePosition]);

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto w-auto whitespace-nowrap snap-container"
    >
      {elements.map((e, i) => (
        <div
          key={`scrollElement-${i}`}
          ref={(element) => {
            elementsRef.current[i] = element;
          }}
          className="inline-block w-full whitespace-normal snap-element"
        >
          {e}
        </div>
      ))}
    </div>
  );
}
