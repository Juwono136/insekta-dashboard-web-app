import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../redux/slices/authSlice";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiCamera,
  FiAlertCircle,
  FiInfo,
  FiCheckCircle,
} from "react-icons/fi";
import PageLoader from "../components/PageLoader";
import { getImageUrl } from "../utils/imageUrl";
import Breadcrumbs from "../components/Breadcrumbs";

const UserProfile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isFirstLogin = userInfo?.isFirstLogin;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State untuk Modal Konfirmasi
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        name: userInfo.name,
        email: userInfo.email,
      }));
      // GUNAKAN HELPER URL DISINI
      setAvatarPreview(getImageUrl(userInfo.avatar));
    }
  }, [userInfo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Fungsi validasi sebelum buka modal
  const handlePreSubmit = (e) => {
    e.preventDefault();

    // Validasi Password
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Konfirmasi password baru tidak cocok!");
      }
      if (!isFirstLogin && !formData.oldPassword) {
        return toast.error("Mohon masukkan password lama untuk keamanan.");
      }
    }

    // Jika lolos validasi, buka modal konfirmasi
    setIsConfirmOpen(true);
  };

  // Fungsi Submit Asli (Dijalankan setelah konfirmasi modal)
  const executeUpdate = async () => {
    setIsConfirmOpen(false); // Tutup modal
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      if (formData.password) {
        data.append("password", formData.password);
        if (!isFirstLogin) {
          data.append("oldPassword", formData.oldPassword);
        }
      }

      const res = await api.put("/users/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(setCredentials(res.data));
      toast.success("Profile berhasil diperbarui!");

      if (isFirstLogin && formData.password) {
        toast.success("Akun aktif. Mengalihkan...");
        navigate(userInfo.role === "admin" ? "/admin/dashboard" : "/dashboard");
      } else {
        setFormData((prev) => ({
          ...prev,
          oldPassword: "",
          password: "",
          confirmPassword: "",
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <Breadcrumbs />

      {isFirstLogin && (
        <div className="alert alert-warning shadow-lg mb-8 animate-pulse border-l-4 border-orange-600">
          <FiAlertCircle className="text-2xl" />
          <div>
            <h3 className="font-bold">Penting: Keamanan Akun</h3>
            <div className="text-xs">
              Anda baru pertama kali login. Demi keamanan, Anda <b>diwajibkan mengganti password</b>{" "}
              sebelum mengakses menu lain.
            </div>
          </div>
        </div>
      )}

      <div className="card bg-white shadow-xl border border-gray-100 overflow-hidden">
        <div className="h-32 bg-linear-to-r from-blue-800 to-blue-600"></div>

        <div className="card-body pt-0 relative">
          {/* AVATAR SECTION */}
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full ring-4 ring-white bg-gray-200 overflow-hidden shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-4xl font-bold">
                    {userInfo?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <label
                className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full text-white cursor-pointer hover:bg-orange-600 shadow-sm transition-all hover:scale-110"
                title="Ganti Foto"
              >
                <FiCamera />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold mt-4 text-gray-800">{userInfo?.name}</h2>
            <p className="text-gray-500 text-sm tracking-widest font-semibold">
              {userInfo?.companyName}
            </p>
            <div
              className={`badge badge-outline capitalize mt-2 font-semibold ${
                userInfo?.role === "client" ? "badge-warning" : "badge-success"
              }`}
            >
              {userInfo?.role}
            </div>
          </div>

          <form onSubmit={handlePreSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="form-control">
              <label className="label font-semibold text-gray-600">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <FiUser className="text-gray-400 group-focus-within:text-blue-800" />
                </div>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full pl-10 focus:border-blue-800"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label font-semibold text-gray-600">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full pl-10 bg-gray-100 text-gray-500 cursor-not-allowed"
                  value={formData.email}
                  disabled
                />
              </div>
            </div>

            <div className="md:col-span-2 border-t border-gray-100 pt-8 mt-4">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg">
                <FiLock className="text-orange-500" /> Ganti Password
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!isFirstLogin && (
                  <div className="md:col-span-2">
                    <label className="label font-semibold text-gray-600">
                      Password Lama <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      placeholder="Masukkan password lama"
                      className="input input-bordered w-full focus:border-orange-500"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      required={formData.password.length > 0}
                    />
                  </div>
                )}
                <div>
                  <label className="label font-semibold text-gray-600">
                    Password Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder={
                      isFirstLogin ? "Wajib buat password baru" : "Kosongkan jika tidak diganti"
                    }
                    className="input input-bordered w-full focus:border-orange-500"
                    value={formData.password}
                    onChange={handleChange}
                    required={isFirstLogin}
                  />
                </div>
                <div>
                  <label className="label font-semibold text-gray-600">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Ulangi password baru"
                    className="input input-bordered w-full focus:border-orange-500"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={formData.password.length > 0}
                  />
                </div>
              </div>
              <div className="mt-6 bg-red-50 p-4 rounded-lg flex gap-3 items-start text-sm text-red-800">
                <FiInfo className="mt-0.5 text-lg shrink-0" />
                <div>
                  <p className="font-bold">Catatan:</p>
                  <p className="opacity-90">Pastikan Anda mengingat password baru Anda.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex justify-end gap-4 mt-4 pt-4 border-t border-gray-100">
              {!isFirstLogin && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-ghost text-gray-500"
                >
                  Batal
                </button>
              )}
              {/* Tombol Submit sekarang membuka Modal */}
              <button
                type="submit"
                className="btn bg-blue-800 hover:bg-blue-900 text-white px-4 shadow-lg shadow-blue-800/20"
              >
                <FiSave className="mr-1" /> Simpan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL KONFIRMASI UPDATE */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Simpan Perubahan?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Pastikan data yang Anda masukkan sudah benar.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="btn btn-ghost flex-1 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  onClick={executeUpdate}
                  className="btn bg-blue-800 hover:bg-blue-900 text-white border-none flex-1"
                >
                  Ya, Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
