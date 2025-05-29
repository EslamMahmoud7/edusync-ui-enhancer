import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthProvider";
import Layout from "./layouts/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import CoursesPage from "./pages/Student/CoursesPage";
import AssignmentsPage from "./pages/Student/AssignmentsPage";
import Profile from "./pages/Student/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
