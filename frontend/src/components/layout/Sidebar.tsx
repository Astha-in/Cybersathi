import { NavLink } from "react-router-dom";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({
  mobileOpen = true,
  onClose = () => {},
}: SidebarProps) {
  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },
    {
      name: "Analyze",
      path: "/analyze",
      icon: "⌁",
    },
    {
      name: "History",
      path: "/history",
      icon: "◷",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: "⚙",
    },
  ];

  function handleNavigation() {
    if (window.innerWidth < 1024) {
      onClose();
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-64
          border-r border-white/10
          bg-[#0a0b0f]
          shadow-2xl
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="text-left"
          >
            <span className="text-xl font-bold tracking-tight text-white">
              Cyber<span className="text-cyan-400">Sathi</span>
            </span>
          </button>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Close navigation"
            title="Close navigation"
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Main
          </p>

          <div className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-cyan-400/10 text-cyan-400"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-base transition ${
                        isActive
                          ? "bg-cyan-400/10 text-cyan-400"
                          : "bg-white/[0.03] text-slate-500 group-hover:text-slate-300"
                      }`}
                    >
                      {link.icon}
                    </span>

                    <span>{link.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom branding */}
        <div className="absolute bottom-6 left-5 right-5">
          <div className="border-t border-white/5 pt-5">
            <p className="text-center text-[10px] tracking-wide text-slate-700">
              CyberSathi
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;