/**
 * Landing route group layout.
 *
 * The root layout wraps every page in a <main> with top/bottom padding and
 * injects the authenticated Navigation component. The landing page manages
 * its own full-screen shell (complete with its own header, bottom nav, and
 * padding), so we must NOT apply the root <main> wrapper here.
 *
 * By placing the landing page inside this route group and exporting a
 * passthrough layout, the root layout's children slot receives this layout's
 * output directly — so the root layout's <main> wrapper still applies.
 *
 * To avoid double-wrapping we override the segment layout to render children
 * without any additional markup, then reset the padding via negative margin
 * on the landing page shell itself.
 *
 * NOTE: Next.js nested layouts compose from the outside in, so the root
 * layout's <main> WILL still wrap this. We compensate in the landing page
 * component by using a negative-margin escape hatch so it occupies the full
 * viewport regardless.
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
