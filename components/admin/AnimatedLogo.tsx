import { SITE } from "@/lib/site";

/** The animated logo shown on the owner sign-in screens. Visitors who prefer reduced motion get the still logo. */
export default function AnimatedLogo() {
  return (
    <picture className="adm-login-logo">
      <source media="(prefers-reduced-motion: reduce)" srcSet="/logo-full.png" />
      {/* Plain <img>: an animated GIF must not go through the image optimizer. */}
      <img src="/logo-animated.gif" alt={SITE.brand} width={718} height={237} />
    </picture>
  );
}
