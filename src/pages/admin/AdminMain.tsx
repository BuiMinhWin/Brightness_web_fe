import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SummarizeStats from "@/components/admin/SummarizeStats";
import UserList from "@/components/admin/UserList";
import AddUser from "@/components/admin/AddUser";
import ViewEditUser from "@/components/admin/ViewEditUser";

const AdminMain: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminSidebar />}>
        <Route index element={<Navigate to="/admin/summary-stats" replace />} />
        <Route path="summary-stats" element={<SummarizeStats />} />
        <Route path="user-controls" element={<UserList />} />
        <Route path="add-user" element={<AddUser />} />
        <Route path="view-edit-user" element={<ViewEditUser />} />
        <Route path="post-management" element={<div>Post Management - Coming Soon</div>} />
        <Route path="event-management" element={<div>Event Management - Coming Soon</div>} />
        <Route path="settings" element={<div>Settings - Coming Soon</div>} />
      </Route>
    </Routes>
  );
};

export default AdminMain;
