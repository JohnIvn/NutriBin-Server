import Sidebar from "@/components/partials/sidebar";
import PageRouter from "./PageRouter";
import Footer from "@/components/partials/footer";
import Header from "@/components/partials/header";
import { useUser } from "@/contexts/UserContext";
import { useLocation } from "react-router-dom";

function MainLayout() {
  const { user } = useUser();
  const { pathname } = useLocation();

  const showPublicHeader = !user && pathname !== "/login";

  return (
    <section className="min-h-screen w-full flex bg-[#FFF5E4]">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col min-h-screen">
        {showPublicHeader && <Header />}

        <div className="flex-1 flex flex-col">
          <PageRouter />
        </div>
        {!user && <Footer />}
      </div>
    </section>
  );
}

export default MainLayout;
