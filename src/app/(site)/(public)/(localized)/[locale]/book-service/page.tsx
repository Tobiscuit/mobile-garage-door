import { redirect } from 'next/navigation';

export default function BookServicePage() {
  redirect('/contact?source=portal');
}
