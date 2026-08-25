import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { navbar } from "../index";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const firstName = user?.name?.trim().split(" ").pop();

  return (
    <>
      <nav className="bg-neutral-primary fixed w-full z-20 top-0 start-0">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 md:flex-nowrap">

          <a
            href="https://vinbus.vn/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <span
              className="self-center text-2xl text-heading font-bold whitespace-nowrap text-green-600
              backdrop-blur-3xl shadow-2xl px-2 py-1 rounded-2xl"
            >
              VinBus
            </span>
          </a>

          {/* Auth buttons */}
          <div className="flex shrink-0 md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {!isAuthenticated ? (
  <>
    <Link
      to="/login"
      className="mr-2 rounded-xl bg-neutral-600 px-2 py-1.5 font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
    >
      Đăng nhập
    </Link>

    <Link
      to="/register"
      className="rounded-xl bg-green-600 px-2 py-1.5 font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
    >
      Đăng ký
    </Link>
  </>
) : (
  <div className="relative">
    <button
      type="button"
      onClick={() => setIsProfileOpen((prev) => !prev)}
      className="flex items-center gap-2 rounded-xl transition hover:bg-white/20 cursor-pointer"
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-white/50"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 font-bold text-white">
          {firstName?.charAt(0).toUpperCase()}
        </div>
      )}

      <span className="hidden font-medium text-heading sm:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-0.5">
        {firstName}
      </span>

      {/* <svg
        className={`h-4 w-4 transition-transform ${
          isProfileOpen ? "rotate-180" : ""
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m19 9-7 7-7-7"
        />
      </svg> */}
    </button>

    {isProfileOpen && (
      <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl">

        {/* User info */}
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 font-bold text-white">
                {firstName?.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {user?.name}
              </p>

              <p className="truncate text-sm text-slate-500">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="p-2">

          <Link
            to="/profile"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <span>👤</span>
            Hồ sơ
          </Link>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <span>🌐</span>
            Ngôn ngữ
            <span className="ml-auto text-xs text-slate-400">
              Tiếng Việt
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              setIsProfileOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <span>🚪</span>
            Đăng xuất
          </button>

        </div>
      </div>
    )}
  </div>
)}

  {/* mobile menu button giữ nguyên */}
      </div>

          {/* Navigation */}
          <div
            className="items-center justify-between hidden w-full shrink-0 md:flex md:w-auto md:order-1 bg-white/20 backdrop-blur-3xl border border-white/10 shadow-2xl px-5 py-2.5 rounded-2xl"
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-400 rounded-base bg-neutral-secondary-soft md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-neutral-primary">
              {navbar.map((nav) => (
                <li key={nav.id}>
                  <NavLink
                    to={nav.link}
                    end={nav.link === "/"}
                    className={({ isActive }) =>
                      `block py-2 px-3 text-heading bg-brand rounded-sm md:bg-transparent md:text-fg-brand md:p-0 ${
                        isActive
                          ? "underline underline-offset-4 decoration-2"
                          : ""
                      }`
                    }
                  >
                    {nav.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </nav>
    </>
  );
};

export default NavBar;