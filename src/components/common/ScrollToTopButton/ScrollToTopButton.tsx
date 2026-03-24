"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

import styles from "./ScrollToTopButton.module.css";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollElement = document.querySelector(
      "[data-board-scroll]",
    ) as HTMLElement | null;

    if (!scrollElement) return;

    const handleScroll = () => {
      setIsVisible(scrollElement.scrollTop > 120);
    };

    scrollElement.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    const scrollElement = document.querySelector(
      "[data-board-scroll]",
    ) as HTMLElement | null;

    if (!scrollElement) return;

    scrollElement.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      aria-label="맨 위로 이동"
    >
      <ChevronUp size={18} />
    </button>
  );
}
