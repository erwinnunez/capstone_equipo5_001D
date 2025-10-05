// src/components/ui/AdminDashboard.tsx
import { useState } from "react";
import { DashboardLayout } from "../DashboardLayout";
import AdminSidebar from "./AdminSidebar";
import type { AdminSection } from "./AdminSidebar";
import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminAnalytics from "./AdminAnalytics";
import AdminAudit from "./AdminAudit";
import AdminSettings from "./AdminSettings";

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [section, setSection] = useState<AdminSection>("overview");

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      sidebarContent={<AdminSidebar current={section} onSelect={setSection} />}
      notifications={5}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">System Administration</h2>
          <p className="text-gray-600">Manage users, monitor system activity, and maintain security</p>
        </div>

        {/* Content by section */}
        {section === "overview"  && <AdminOverview />}
        {section === "users"     && <AdminUsers />}
        {section === "analytics" && <AdminAnalytics />}
        {section === "audit"     && <AdminAudit />}
        {section === "settings"  && <AdminSettings />}
      </div>
    </DashboardLayout>
  );
}
