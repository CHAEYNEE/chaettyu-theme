import styles from "./ThemeDetailContent.module.css";

type ThemeDetailContentProps = {
  detailHtml: string;
};

export default function ThemeDetailContent({
  detailHtml,
}: ThemeDetailContentProps) {
  return (
    <div
      className={styles.detailEditorContent}
      dangerouslySetInnerHTML={{ __html: detailHtml }}
    />
  );
}
