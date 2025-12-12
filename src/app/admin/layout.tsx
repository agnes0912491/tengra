// Admin layout - just passes through to child routes
// Auth protection is handled in AdminShell component for /dashboard routes
// and directly in page components for other admin routes

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
