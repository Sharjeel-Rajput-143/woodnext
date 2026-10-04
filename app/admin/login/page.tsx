import LoginForm from "@/components/admin/LoginForm";

// Static page (served instantly from the CDN). Logged-in owners are sent to /admin after signing in.
export default function LoginPage() {
  return <LoginForm />;
}
