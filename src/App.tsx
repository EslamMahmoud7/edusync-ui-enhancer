
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./layouts/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import CoursesPage from "./pages/Student/CoursesPage";
import AssignmentsPage from "./pages/Student/AssignmentsPage";
import Profile from "./pages/Student/Profile";
import SchedulePage from "./pages/Student/SchedulePage";
import './i18n/config';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Index />} />
                    <Route path="courses" element={<CoursesPage />} />
                    <Route path="assignments" element={<AssignmentsPage />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="schedule" element={<SchedulePage />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
