import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import authService from "../services/authService";
import toast from "react-hot-toast";
import { FiLock, FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import PageLoader from "../components/PageLoader";
import LogoInsektaWhite from "../assets/logo-insekta-white.png";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    }
  }, [userInfo, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userData = await authService.login(formData);
      dispatch(setCredentials(userData));
      toast.success(`Selamat datang, ${userData.name}!`);

      if (userData.isFirstLogin) navigate("/profile?alert=change-password");
      else if (userData.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Login gagal";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    // Background Utama: Mobile Gradient (Biru Tua ke Gelap), Desktop Abu-abu
    <div className="min-h-screen flex flex-col lg:flex-row bg-linear-to-br from-blue-800 to-blue-950 lg:from-gray-100 lg:to-gray-100">
      {/* --- BAGIAN KIRI (BRANDING DESKTOP) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-800 relative items-center justify-center overflow-hidden">
        {/* Overlay Gradient Biru */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-900 to-blue-800 opacity-90"></div>

        {/* Dekorasi Background */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-overlay filter blur-2xl opacity-30"></div>

        <div className="relative z-10 text-center text-white p-12">
          <div className="inline-block px-6 py-5 bg-white/20 rounded-2xl backdrop-blur-md mb-8 shadow-2xl border border-white/10">
            <img src={LogoInsektaWhite} alt="logo-insekta" className="h-21" />
          </div>
          <p className="text-xl max-w-md mx-auto opacity-90 leading-relaxed font-light">
            Dashboard Pengendalian Hama PT Insekta Fokustama
          </p>
        </div>
      </div>

      {/* --- BAGIAN KANAN (FORM LOGIN) --- */}
      <div className="flex-1 flex gap-4 flex-col items-center justify-center p-5 sm:p-8 relative">
        {/* Branding Mobile (Hanya muncul di HP) */}
        <div className="text-center lg:hidden text-white z-10">
          <div className="inline-block px-6 py-4 bg-white/20 rounded-2xl backdrop-blur-md border shadow-2xl border-white/10">
            <img src={LogoInsektaWhite} alt="logo-insekta" className="h-12" />
          </div>
        </div>

        {/* Card Form */}
        <div className="card w-full max-w-md bg-white shadow-2xl lg:shadow-xl border-none lg:border border-gray-200 transform transition-all duration-500 mt-0 rounded-2xl">
          <div className="card-body px-6 py-10 sm:px-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Selamat Datang</h2>
              <p className="text-gray-500 text-sm mt-1">Silakan masuk ke akun Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Input Email */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Email
                  </span>
                </label>
                {/* 'group' di sini adalah class bawaan Tailwind untuk parent-child interaction */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <FiMail className="text-gray-400 text-lg group-focus-within:text-blue-800 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Masukkan email anda"
                    // Ring dan Border menggunakan warna Biru Tua (blue-800)
                    className="input input-bordered w-full pl-10 bg-gray-50 focus:bg-white focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 transition-all text-gray-800 rounded-lg"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="form-control">
                <label className="label py-1 flex justify-between">
                  <span className="label-text font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Password
                  </span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <FiLock className="text-gray-400 text-lg group-focus-within:text-blue-800 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"} // Toggle tipe input
                    name="password"
                    placeholder="••••••••"
                    className="input input-bordered w-full pl-10 pr-10 bg-gray-50 focus:bg-white focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 transition-all text-gray-800 rounded-lg"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button" // Penting: type button agar tidak submit form
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 cursor-pointer text-gray-400 hover:text-blue-800 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <FiEyeOff className="text-lg" />
                    ) : (
                      <FiEye className="text-lg" />
                    )}
                  </button>
                </div>
                <label className="label justify-end mt-2">
                  {/* Link warna Orange */}
                  <Link
                    to="/forgot-password"
                    className="label-text-alt font-medium text-orange-500 hover:text-orange-700 transition"
                  >
                    Lupa Password?
                  </Link>
                </label>
              </div>

              {/* Tombol Submit Warna Biru Tua */}
              <button
                type="submit"
                className="btn bg-blue-800 hover:bg-blue-900 text-white border-none w-full text-base h-12 shadow-lg shadow-blue-800/30 mt-4 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Memuat..." : "Login"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} Insekta - Pest & Termite Control
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
