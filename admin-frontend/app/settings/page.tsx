"use client";

import { useAdmin } from "@/core/context/AdminContext";
import { SettingsView } from "@/components/admin/sections/SettingsView";
import { API_BASE_URL } from "@/config/env";

export default function SettingsPage() {
  const { token, userLabel } = useAdmin();

  return (
    <SettingsView 
      apiBaseUrl={API_BASE_URL} 
      token={token || ""} 
      userLabel={userLabel} 
    />
  );
}
