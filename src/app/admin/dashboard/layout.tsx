import AdminDashboardLayout from "@widgets/admin/AdminDashboardLayout"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
