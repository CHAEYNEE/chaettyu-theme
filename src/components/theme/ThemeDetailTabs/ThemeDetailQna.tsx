"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { ThemeQna } from "@/types/theme";

import styles from "./ThemeDetailQna.module.css";

type ThemeDetailQnaProps = {
  qnas: ThemeQna[];
};

const LOAD_COUNT = 5;

export default function ThemeDetailQna({ qnas }: ThemeDetailQnaProps) {
  const [visibleCount, setVisibleCount] = useState(LOAD_COUNT);
  const [openIds, setOpenIds] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  if (qnas.length === 0) {
    return <div className={styles.emptyState}>아직 등록된 문의가 없어요.</div>;
  }

  const visibleQnas = qnas.slice(0, visibleCount);
  const hasMoreQnas = visibleCount < qnas.length;
  const remainingCount = qnas.length - visibleQnas.length;

  return (
    <div className={styles.qnaWrap}>
      <ul className={styles.list}>
        {visibleQnas.map((item) => {
          const isAnswered = Boolean(item.answer);
          const isOpen = openIds.includes(item.id);

          return (
            <li key={item.id} className={styles.card}>
              <button
                type="button"
                className={styles.summaryButton}
                onClick={() => handleToggle(item.id)}
                aria-expanded={isOpen}
              >
                <div className={styles.summaryTop}>
                  <div className={styles.metaLeft}>
                    <strong className={styles.author}>{item.author}</strong>
                    <span className={styles.date}>{item.createdAt}</span>
                  </div>

                  <div className={styles.metaRight}>
                    <span
                      className={`${styles.statusBadge} ${
                        isAnswered ? styles.answered : styles.pending
                      }`}
                    >
                      {isAnswered ? "답변완료" : "답변대기"}
                    </span>

                    <span
                      className={`${styles.arrowIcon} ${
                        isOpen ? styles.arrowOpen : ""
                      }`}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>

                <div className={styles.questionRow}>
                  <span className={styles.qnaLabel}>Q</span>
                  <p
                    className={`${styles.questionText} ${
                      isOpen ? styles.questionTextOpen : ""
                    }`}
                  >
                    {item.question}
                  </p>
                </div>
              </button>

              {isOpen && isAnswered && (
                <div className={styles.answerBox}>
                  <span className={styles.qnaLabel}>A</span>
                  <p className={styles.bodyText}>{item.answer}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {hasMoreQnas && (
        <div className={styles.moreButtonRow}>
          <button
            type="button"
            className={styles.moreButton}
            onClick={() => setVisibleCount((prev) => prev + LOAD_COUNT)}
          >
            문의 더보기 ({Math.min(LOAD_COUNT, remainingCount)}개)
          </button>
        </div>
      )}
    </div>
  );
}
