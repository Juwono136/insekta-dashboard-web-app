import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// assets
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import LogoInsektaWhite from "../assets/logo-insekta-white.png";

// features
import authService from "../services/authService";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading || isSuccess) return;
    if (password.length < 6) return toast.error("Password minimal 6 karakter.");
    if (password !== confirmPassword) return toast.error("Konfirmasi password tidak cocok.");

    setIsLoading(true);

    try {
      const response = await authService.resetPassword(token, password);

      console.log("Respon Server:", response);

      const successMessage = response?.data?.message || "Password berhasil diubah!";

      setIsSuccess(true);
      toast.success(successMessage);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error Reset:", error);

      let message = "Gagal mereset password.";

      if (error.response && error.response.data) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      toast.error(message);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-linear-to-br from-[#093050] to-blue-800 p-4">
      <div className="text-center text-white z-10">
        <div className="inline-block px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-sm shadow-2xl mb-1 border border-white/20">
          <img src={LogoInsektaWhite} alt="logo-insekta" className="h-12" />
        </div>
      </div>

      <div className="card w-full max-w-md bg-gray-100 shadow-2xl border-none lg:border border-gray-200 rounded-2xl animate-fade-in-up">
        <div className="card-body px-8 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Reset password</h2>
            <p className="text-gray-500 text-sm mt-2 px-4 leading-relaxed">
              Silahkan masukkan password baru Anda untuk melakukan reset password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="form-control">
              <label className="label text-xs font-bold text-gray-700">Password Baru</label>
              <div className="relative">
                <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 pr-10 focus:border-blue-500"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute z-10 inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Input Konfirmasi Password */}
            <div className="form-control">
              <label className="label text-xs font-bold text-gray-700">Konfirmasi Password</label>
              <div className="relative">
                <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCheckCircle className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 focus:border-blue-500 ${
                    confirmPassword && password !== confirmPassword ? "input-error" : ""
                  }`}
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <label className="label mt-1">
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <FiAlertCircle /> Password tidak cocok
                  </span>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="btn bg-[#093050] hover:bg-blue-800 text-white w-full shadow-lg border-none"
            >
              {isLoading ? <span className="loading loading-spinner"></span> : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
