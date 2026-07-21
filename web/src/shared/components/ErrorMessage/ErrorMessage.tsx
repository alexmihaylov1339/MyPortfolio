import type { ErrorMessageProps } from './types';

import styles from './ErrorMessage.module.scss';

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {

  return <div className={`${styles.errorMessage} ${className}`}>{message}</div>;
}

