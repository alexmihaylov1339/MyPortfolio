import { useEffect } from 'react';
import type { NotificationProps } from './types';

import styles from './Notification.module.scss';

export default function Notification({
  id,
  type,
  message,
  duration = 3000,
  onClose,
}: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <p className={styles.message}>{message}</p>
      <button
        className={styles.closeButton}
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
