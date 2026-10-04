import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { adminConfigured, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <LoginForm configured={adminConfigured()} />;
}
