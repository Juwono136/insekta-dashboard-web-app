import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import toast from "react-hot-toast";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import PageLoader from "../components/PageLoader";
import LogoInsekta from "../assets/logo-insekta.webp";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("Link reset password telah dikirim!");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    // Background Mobile Gradient Biru Tua
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-linear-to-br from-blue-800 to-blue-950 p-4">
      <div className="text-center text-white z-10">
        <div className="inline-block px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-sm shadow-2xl mb-1 border border-white/20">
          <img src={LogoInsekta} alt="logo-insekta" className="h-12" />
        </div>
      </div>

      <div className="card w-full max-w-md bg-gray-100 shadow-2xl border-none lg:border border-gray-200 rounded-2xl animate-fade-in-up">
        <div className="card-body px-8 py-10">
          {/* Tombol Kembali */}
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-blue-800 mb-6 transition-colors group font-medium"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
            ke Login
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Lupa Password?</h2>
            <p className="text-gray-500 text-sm mt-2 px-4 leading-relaxed">
              Masukkan email yang terdaftar, kami akan mengirimkan instruksi reset password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="form-control">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <FiMail className="text-gray-400 text-lg group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="Masukkan email Anda"
                  // Ring warna Orange saat focus
                  className="input input-bordered w-full pl-10 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-800 rounded-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Tombol Kirim Warna Orange */}
            <button
              type="submit"
              className="btn bg-orange-500 hover:bg-orange-600 text-white border-none w-full h-12 text-base shadow-lg shadow-orange-500/20 rounded-lg"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
