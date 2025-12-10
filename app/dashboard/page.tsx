// app/dashboard/page.tsx
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Await cookies() because it returns a Promise
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/"); // redirect to login if no token
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard! You are authenticated.</p>
    </div>
  );
}
