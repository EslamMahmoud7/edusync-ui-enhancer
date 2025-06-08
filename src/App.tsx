
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
import StudentAcademicRecords from "./pages/Student/AcademicRecords";
import AcademicRecords from "./pages/Admin/AcademicRecords";
import StudentQuizzes from "./pages/Student/StudentQuizzes";
import QuizTaking from "./pages/Student/QuizTaking";
import QuizResult from "./pages/Student/QuizResult";
import CourseManagement from "./pages/Admin/CourseManagement";
import GroupManagement from "./pages/Admin/GroupManagement";
import UserManagement from "./pages/Admin/UserManagement";
import InstructorQuizzes from "./pages/Instructor/InstructorQuizzes";
import QuizEditor from "./pages/Instructor/QuizEditor";
import QuizModels from "./pages/Instructor/QuizModels";
import QuizAttempts from "./pages/Instructor/QuizAttempts";
import InstructorGroups from "./pages/Instructor/InstructorGroups";
import InstructorAssignments from "./pages/Instructor/InstructorAssignments";
import InstructorGrading from "./pages/Instructor/InstructorGrading";
import './i18n/config';
import Notifications from "./pages/Notifications";

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
                    <Route path="quizzes" element={
                      <RoleGuard allowedRoles={[0, 1]}>
                        <StudentQuizzes />
                      </RoleGuard>
                    } />
                    <Route path="student/quiz-info/:quizId" element={
                      <RoleGuard allowedRoles={[0, 1]}>
                        <QuizTaking />
                      </RoleGuard>
                    } />
                    <Route path="student/quiz-taking/:quizId" element={
                      <RoleGuard allowedRoles={[0, 1]}>
                        <QuizTaking />
                      </RoleGuard>
                    } />
                    <Route path="student/quiz-result/:attemptId" element={
                      <RoleGuard allowedRoles={[0, 1]}>
                        <QuizResult />
                      </RoleGuard>
                    } />
                    <Route path="profile" element={
                      <RoleGuard allowedRoles={[0, 1, 2, 3]}>
                        <Profile />
                      </RoleGuard>
                    } />
                    <Route path="notifications" element={
                      <RoleGuard allowedRoles={[0, 1, 2, 3]}>
                        <Notifications />
                      </RoleGuard>
                    } />
                    <Route path="schedule" element={
                      <RoleGuard allowedRoles={[0, 1]}>
                        <SchedulePage />
                      </RoleGuard>
                    } />
                    <Route path="academicRecords" element={
                      <RoleGuard allowedRoles={[0, 1]}>
                        <StudentAcademicRecords />
                      </RoleGuard>
                    } />

                    <Route path="admin-dashboard" element={
                      <RoleGuard allowedRoles={[2]}>
                        <AdminDashboard />
                      </RoleGuard>
                    } />
                    <Route path="admin/academic-records" element={
                      <RoleGuard allowedRoles={[2]}>
                        <AcademicRecords />
                      </RoleGuard>
                    } />
                    <Route path="admin/courses" element={
                      <RoleGuard allowedRoles={[2]}>
                        <CourseManagement />
                      </RoleGuard>
                    } />
                    <Route path="admin/groups" element={
                      <RoleGuard allowedRoles={[2]}>
                        <GroupManagement />
                      </RoleGuard>
                    } />
                    <Route path="admin/users" element={
                      <RoleGuard allowedRoles={[2]}>
                        <UserManagement />
                      </RoleGuard>
                    } />
                    <Route path="admin/notifications" element={
                      <RoleGuard allowedRoles={[2]}>
                        <Notifications />
                      </RoleGuard>
                    } />

                    <Route path="instructor-dashboard" element={
                      <RoleGuard allowedRoles={[3]}>
                        <InstructorDashboard />
                      </RoleGuard>
                    } />
                    <Route path="instructor/groups" element={
                      <RoleGuard allowedRoles={[3]}>
                        <InstructorGroups />
                      </RoleGuard>
                    } />
                    <Route path="instructor/assignments" element={
                      <RoleGuard allowedRoles={[3]}>
                        <InstructorAssignments />
                      </RoleGuard>
                    } />
                    <Route path="instructor/grading" element={
                      <RoleGuard allowedRoles={[3]}>
                        <InstructorGrading />
                      </RoleGuard>
                    } />
                    <Route path="instructor/quizzes" element={
                      <RoleGuard allowedRoles={[3]}>
                        <InstructorQuizzes />
                      </RoleGuard>
                    } />
                    <Route path="instructor/quiz/:quizId" element={
                      <RoleGuard allowedRoles={[3]}>
                        <QuizEditor />
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
