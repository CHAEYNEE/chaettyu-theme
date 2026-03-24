"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./CustomDropdown.module.css";

export type DropdownOption = {
  label: string;
  value: string;
};

type CustomDropdownProps = {
  value: string;
  options: DropdownOption[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function CustomDropdown({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleToggle() {
    if (disabled) {
      return;
    }

    setIsOpen((prev) => !prev);
  }

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className={`${styles.dropdown} ${disabled ? styles.disabledDropdown : ""}`}
    >
      <button
        type="button"
        className={`${styles.trigger} ${!value ? styles.placeholderTrigger : ""}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.triggerText}>
          {selectedOption?.label ?? placeholder}
        </span>

        <svg
          className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.menu} role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.menuItem} ${
                  isSelected ? styles.activeMenuItem : ""
                }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={isSelected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
