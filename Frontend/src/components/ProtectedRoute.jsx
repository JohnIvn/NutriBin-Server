import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

export function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <h1>Loading...</h1>
      </div>
    );
  }

  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  return children;
}
