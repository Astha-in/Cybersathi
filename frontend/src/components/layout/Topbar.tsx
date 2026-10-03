import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";



interface TopbarProps {
  onMenuClick: () => void;
}

function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#08090d]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-400"
          aria-label="Toggle navigation"
          title="Menu"
        >
          ☰
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-left"
        >
          <span className="text-xl font-bold tracking-tight text-white">
            Cyber<span className="text-cyan-400">Sathi</span>
          </span>
        </button>
      </div>

      {/* Right */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setProfileOpen((current) => !current)}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 transition hover:border-white/20 hover:bg-white/[0.06]"
          aria-label="Open profile menu"
          aria-expanded={profileOpen}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-black">
            {initials}
          </div>

          <div className="hidden text-left sm:block">
            <p className="max-w-[130px] truncate text-sm font-semibold text-white">
              {user?.name || "User"}
            </p>
          </div>

          <span
            className={`hidden text-xs text-slate-500 transition sm:block ${
              profileOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {/* Profile dropdown */}
        {profileOpen && (
          <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#101218] shadow-2xl shadow-black/40">

            {/* User information */}
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 font-bold text-black">
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.name || "User"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="p-2">
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
                  ⚙
                </span>

                <span>Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/5">
                  ↪
                </span>

                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;