import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import styles from "./AdminActionButton.module.css";

type AdminActionButtonProps = {
  children: ReactNode;
  href?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function AdminActionButton({
  children,
  href,
  ...props
}: AdminActionButtonProps) {
  if (href) {
    return (
      <Link href={href} className={styles.button}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={styles.button} {...props}>
      {children}
    </button>
  );
}
