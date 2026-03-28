import Link from "next/link";

import styles from "./AdminQuickActions.module.css";

type QuickAction = {
  href: string;
  label: string;
};

type AdminQuickActionsProps = {
  items: QuickAction[];
};

export default function AdminQuickActions({ items }: AdminQuickActionsProps) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={styles.button}>
          {item.label}
        </Link>
      ))}
    </div>
  );
}
