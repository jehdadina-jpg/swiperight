import { useEffect } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { GrainOverlay } from "@/components/grain-overlay";
import { Nav } from "@/components/nav";
import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/lib/auth";
import { useSavedCards } from "@/lib/savedCards";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Cards from "@/pages/Cards";
import Compare from "@/pages/Compare";
import Saved from "@/pages/Saved";
import Quiz from "@/pages/Quiz";
import Expenses from "@/pages/Expenses";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Pages that share the top navigation bar
function AppLayout() {
  return (
    <div className="min-h-screen bg-ink">
      <Nav />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </div>
  );
}

export default function App() {
  const user = useAuth((s) => s.user);
  const restore = useAuth((s) => s.restore);
  const loadFromServer = useSavedCards((s) => s.loadFromServer);

  useEffect(() => {
    restore();
  }, [restore]);

  // Once signed in, adopt the shortlist stored in MongoDB
  useEffect(() => {
    if (user) loadFromServer().catch(() => undefined);
  }, [user, loadFromServer]);

  return (
    <>
      <GrainOverlay />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/expenses" element={<Expenses />} />
        </Route>
      </Routes>
    </>
  );
}
