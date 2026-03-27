import Link from "next/link";

import styles from "./AdminShell.module.css";

type AdminShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function AdminShell({
  title,
  description,
  children,
}: AdminShellProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>chaettyu.theme admin</div>

        <nav className={styles.nav}>
          <Link href="/admin" className={styles.link}>
            대시보드
          </Link>
          <Link href="/admin/themes" className={styles.link}>
            테마 관리
          </Link>
          <Link href="/admin/purchases" className={styles.link}>
            구매 내역
          </Link>
          <Link href="/admin/members" className={styles.link}>
            회원 관리
          </Link>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </header>

        <section className={styles.content}>{children}</section>
      </main>
    </div>
  );
}
