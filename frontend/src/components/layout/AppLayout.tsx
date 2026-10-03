import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:pl-64" : "lg:pl-0"
        }`}
      >
        <Topbar
          onMenuClick={() => setSidebarOpen((current) => !current)}
        />

        <main className="min-h-[calc(100vh-5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;