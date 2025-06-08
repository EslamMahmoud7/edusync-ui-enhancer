import { useState, useEffect } from "react";
import { Users, BookOpen, UserCheck, BarChart3, Plus, Settings, Megaphone } from "lucide-react";
import { useAuth } from "../../Context/useAuth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { announcementService } from "../../services/announcement";
import type { CreateAnnouncementDTO } from "../../types/announcement";

interface AdminDashboardCountsDTO {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalGroups: number;
  recentEnrollments: number;
  systemStats: {
    activeUsers: number;
    pendingAssignments: number;
    upcomingDeadlines: number;
  };
}

interface AnnouncementFormData {
  title: string;
  message: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [dashData, setDashData] = useState<AdminDashboardCountsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  const form = useForm<AnnouncementFormData>({
    defaultValues: {
      title: "",
      message: ""
    }
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const stored = localStorage.getItem("eduSyncUser");
        if (!stored) throw new Error("You are not logged in.");

        const { token } = JSON.parse(stored);

        const headers = { Authorization: `Bearer ${token}` };
        const response = await api.get<AdminDashboardCountsDTO>(
          "/api/AdminDashboard/counts",
          { headers }
        );
        setDashData(response.data);
      } catch (err: any) {
        console.error("Error fetching dashboard counts:", err);
        setError(err.message || "Failed to load dashboard counts.");
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  const handlePostAnnouncement = async (data: AnnouncementFormData) => {
    setIsPostingAnnouncement(true);
    try {
      const announcementData: CreateAnnouncementDTO = {
        title: data.title,
        message: data.message
      };
      
      await announcementService.create(announcementData);
      form.reset();
    } catch (error) {
      console.error("Error posting announcement:", error);
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-600 dark:text-red-400">
          <h2 className="text-xl font-semibold mb-2">Error Loading Admin Dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Students",
      value: dashData?.totalStudents.toString() || "0",
      icon: <Users className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      change: `+${dashData?.recentEnrollments || 0} this week`,
    },
    {
      title: "Total Instructors",
      value: dashData?.totalInstructors.toString() || "0",
      icon: <UserCheck className="h-6 w-6" />,
      color: "from-green-500 to-green-600",
      change: "Active",
    },
    {
      title: "Total Courses",
      value: dashData?.totalCourses.toString() || "0",
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
      change: "Available",
    },
    {
      title: "Active Groups",
      value: dashData?.totalGroups.toString() || "0",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600",
      change: "Running",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "Add, edit, or remove students and instructors",
      icon: <Users className="h-8 w-8" />,
      color: "bg-blue-500",
      action: () => {
        navigate("/admin/users");
      },
    },
    {
      title: "Manage Courses",
      description: "Create and organize course templates",
      icon: <BookOpen className="h-8 w-8" />,
      color: "bg-green-500",
      action: () => {
        navigate("/admin/courses");
      },
    },
    {
      title: "Manage Groups",
      description: "Create groups and assign instructors",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "bg-purple-500",
      action: () => {
        navigate("/admin/groups");
      },
    },
    {
      title: "Manage Academic Records",
      description: "Manage Academic Records",
      icon: <Settings className="h-8 w-8" />,
      color: "bg-orange-500",
      action: () => {
        navigate("/admin/academic-records");
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-edusync-primary via-edusync-secondary to-edusync-accent p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 animate-fade-in">
            Admin Dashboard 👨‍💼
          </h1>
          <p
            className="text-xl opacity-90 max-w-2xl animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Manage your educational platform with comprehensive administrative tools
          </p>
        </div>
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12">
          <div className="w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-edusync-primary" />
          Post Announcement
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePostAnnouncement)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ 
                required: "Title is required",
                minLength: { value: 3, message: "Title must be at least 3 characters" },
                maxLength: { value: 100, message: "Title cannot exceed 100 characters" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter announcement title..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              rules={{ 
                required: "Message is required",
                minLength: { value: 10, message: "Message must be at least 10 characters" },
                maxLength: { value: 1000, message: "Message cannot exceed 1000 characters" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Enter announcement message..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPostingAnnouncement}
              className="px-6 py-2 bg-edusync-primary hover:bg-edusync-secondary text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Megaphone className="h-4 w-4" />
              {isPostingAnnouncement ? "Posting..." : "Post Announcement"}
            </Button>
          </form>
        </Form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white transform transition-transform duration-200 group-hover:scale-110`}
              >
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-edusync-success">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
          <Plus className="h-6 w-6 text-edusync-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={action.title}
              onClick={action.action}
              className="group p-6 bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-edusync-primary/10 hover:to-edusync-accent/10 rounded-xl transition-all duration-200 transform hover:scale-105 animate-fade-in text-left"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-16 h-16 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {dashData?.recentEnrollments || 0} new student enrollments this week
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {dashData?.systemStats?.activeUsers || 0} active users today
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {dashData?.systemStats?.pendingAssignments || 0} pending assignments
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Database Status
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                API Response Time
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                &lt; 200ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active Sessions
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {dashData?.systemStats?.activeUsers || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
