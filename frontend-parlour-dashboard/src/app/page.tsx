import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login page since this is an admin dashboard
  redirect('/login');
  
  // This won't be rendered due to redirect
  return null;
}
