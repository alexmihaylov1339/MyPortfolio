import { redirect } from 'next/navigation';

import { APP_ROUTES } from '@/shared/constants';

export default function HomePage() {
  redirect(APP_ROUTES.dashboard);
}
