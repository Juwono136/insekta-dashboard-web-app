const ClientFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-100 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-4 text-xs md:text-sm text-gray-500">
        {/* Copyright Section */}
        <div className="text-center md:text-left">
          <p>
            &copy; {currentYear}{" "}
            <span className="font-bold text-blue-900">PT Insekta Fokustama</span>.
            <span className="hidden sm:inline"> All rights reserved.</span>
          </p>
        </div>

        {/* Optional: Link / Info Tambahan */}
        {/* <div className="flex items-center gap-4">
          <a href="#" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Terms of Service
          </a>
        </div> */}
      </div>
    </footer>
  );
};

export default ClientFooter;
