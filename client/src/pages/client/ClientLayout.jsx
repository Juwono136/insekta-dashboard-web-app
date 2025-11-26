import ClientFooter from "../../components/ClientFooter";
import Navbar from "../../components/Navbar";

const ClientLayout = ({ children }) => (
  <div className="bg-gray-50">
    <Navbar role="client" />
    <main className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">{children}</main>
    <ClientFooter />
  </div>
);

export default ClientLayout;
