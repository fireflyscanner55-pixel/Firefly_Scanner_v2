
import styles from "./RadioanalysisLoader.module.css";

interface RadioanalysisLoaderProps {
  className?: string;
}

export default function RadioanalysisLoader({
  className = "",
}: RadioanalysisLoaderProps) {
  return (
    <div
      className={`${styles.loaderContainer} ${className}`}
      role="status"
      aria-label="Radioanalysis scanning in progress"
    >
      <div className={styles.loader} aria-hidden="true">
        <div className={styles.nucleus} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
      </div>
    </div>
  );
}
