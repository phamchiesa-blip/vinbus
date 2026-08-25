import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData
      );

      console.log(response.data);

      // Lưu JWT
      login(response.data.data, response.data.token);

      // Sau này AuthContext sẽ xử lý user
      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Đăng nhập thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-slate-100 via-emerald-50/40 to-teal-100/50 px-4 py-20">
      <div className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/60 p-8 shadow-2xl shadow-emerald-950/5 backdrop-blur-xl transition-all duration-300 hover:shadow-emerald-950/10">
        <div>
          <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-600 backdrop-blur-md">
            VinBus
          </span>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            Chào mừng trở lại
          </h1>

          <p className="mt-1.5 text-sm font-medium text-slate-500">
            Đăng nhập để tiếp tục trải nghiệm VinBus.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-600 backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="mt-1.5 w-full rounded-2xl border border-slate-200/70 bg-white/50 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-white/80 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Mật khẩu
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className="mt-1.5 w-full rounded-2xl border border-slate-200/70 bg-white/50 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-white/80 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-600/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-semibold text-emerald-600 transition hover:text-emerald-700 hover:underline underline-offset-4"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;