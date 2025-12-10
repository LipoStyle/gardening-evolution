import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // await cookies()
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");
  const token = tokenCookie?.value;

  if (!token || !verifyToken(token)) {
    redirect("/");
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome! You are successfully authenticated.</p>
    </div>
  );
}
