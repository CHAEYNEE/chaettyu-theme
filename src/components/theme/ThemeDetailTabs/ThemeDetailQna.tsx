import type { ThemeQna } from "@/types/theme";

import styles from "./ThemeDetailQna.module.css";

type ThemeDetailQnaProps = {
  qnas: ThemeQna[];
};

export default function ThemeDetailQna({ qnas }: ThemeDetailQnaProps) {
  if (qnas.length === 0) {
    return <div className={styles.emptyState}>아직 등록된 문의가 없어요.</div>;
  }

  return (
    <ul className={styles.list}>
      {qnas.map((item) => (
        <li key={item.id} className={styles.card}>
          <div className={styles.cardTop}>
            <strong className={styles.author}>{item.author}</strong>
            <span className={styles.date}>{item.createdAt}</span>
          </div>

          <div className={styles.qnaBlock}>
            <span className={styles.qnaLabel}>Q</span>
            <p className={styles.bodyText}>{item.question}</p>
          </div>

          {item.answer && (
            <div className={styles.answerBox}>
              <span className={styles.qnaLabel}>A</span>
              <p className={styles.bodyText}>{item.answer}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
