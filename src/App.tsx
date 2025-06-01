import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import PrivateRoute from "./components/PrivateRoute";
import RoleGuard from "./components/RoleGuard";
import Layout from "./layouts/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import StudentDashboard from "./pages/Student/StudentDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
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
                    {/* Legacy route - redirect to appropriate dashboard */}
                    <Route index element={<Index />} />
                    
                    {/* Student routes */}
                    <Route path="student-dashboard" element={
                      <RoleGuard allowedRoles={[0, 1]}>
                        <StudentDashboard />
                      </RoleGuard>
                    } />
                    <Route path="courses" element={
                      <RoleGuard allowedRoles={[0, 1]}>
                        <CoursesPage />
                      </RoleGuard>
                    } />
                    <Route path="assignments" element={
                      <RoleGuard allowedRoles={[0, 1]}>
                        <AssignmentsPage />
                      </RoleGuard>
                    } />
                    <Route path="profile" element={
                      <RoleGuard allowedRoles={[0, 1, 2, 3]}>
                        <Profile />
                      </RoleGuard>
                    } />
                    <Route path="schedule" element={
                      <RoleGuard allowedRoles={[0, 1]}>
                        <SchedulePage />
                      </RoleGuard>
                    } />

                    {/* Admin routes */}
                    <Route path="admin-dashboard" element={
                      <RoleGuard allowedRoles={[2]}>
                        <AdminDashboard />
                      </RoleGuard>
                    } />

                    {/* Instructor routes */}
                    <Route path="instructor-dashboard" element={
                      <RoleGuard allowedRoles={[3]}>
                        <InstructorDashboard />
                      </RoleGuard>
                    } />
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
