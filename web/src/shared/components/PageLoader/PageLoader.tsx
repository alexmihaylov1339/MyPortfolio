import styles from './PageLoader.module.scss';

export default function PageLoader() {
  return (
    <div className={styles.loader}>
      <div className={styles.spinner} />
    </div>
  );
}

