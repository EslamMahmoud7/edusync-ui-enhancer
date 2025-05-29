
import { useState, useEffect } from "react";
import {
  Pencil,
  UploadCloud,
  Lock,
  Link as LinkIcon,
  Award,
  List,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  TrendingUp,
  Settings,
} from "lucide-react";
import api from "../../services/api";

interface ProfileDTO {
  id: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  joinedDate: string;
  institution: string;
  totalCourses: number;
  gpa: number;
  status: string;
  avatarUrl?: string;
  achievements: string[];
  recentActivity: string[];
  socialLinks: string[];
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem("eduSyncUser");
        if (!stored) throw new Error("Not logged in");
        const { id: userId, token } = JSON.parse(stored);

        const { data } = await api.get<ProfileDTO>(`/api/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data || err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-fade-in">
          <div className="w-12 h-12 border-4 border-edusync-primary/20 border-t-edusync-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">No profile data available.</p>
      </div>
    );
  }

  if (profile.role === "0") profile.role = "Student";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent">
          My Profile
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
          <Pencil className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-8 border border-gray-200/50">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl border-4 border-edusync-primary/20 overflow-hidden bg-gradient-to-br from-edusync-primary/10 to-edusync-accent/10">
              <img
                src={profile.avatarUrl || "/placeholder.svg"}
                alt={`${profile.fullName} avatar`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
            <button
              aria-label="Change avatar"
              className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg hover:bg-white transition-all duration-200 transform hover:scale-105 opacity-0 group-hover:opacity-100"
            >
              <UploadCloud className="w-4 h-4 text-edusync-primary" />
            </button>
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{profile.fullName}</h2>
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <span className="px-4 py-2 bg-edusync-primary/10 text-edusync-primary rounded-full text-sm font-medium">
                  {profile.role}
                </span>
                <span className="px-4 py-2 bg-edusync-success/10 text-edusync-success rounded-full text-sm font-medium">
                  {profile.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-xl">
                <div className="w-10 h-10 bg-edusync-primary/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-edusync-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-xl">
                <div className="w-10 h-10 bg-edusync-secondary/10 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-edusync-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-xl">
                <div className="w-10 h-10 bg-edusync-accent/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-edusync-accent" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Institution</p>
                  <p className="font-medium text-gray-800">{profile.institution}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-xl">
                <div className="w-10 h-10 bg-edusync-success/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-edusync-success" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium text-gray-800">{profile.joinedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            label: "Total Courses", 
            value: profile.totalCourses, 
            icon: <BookOpen className="w-6 h-6" />,
            color: "from-edusync-primary to-edusync-secondary",
            bgColor: "bg-edusync-primary/10"
          },
          { 
            label: "Current GPA", 
            value: profile.gpa.toFixed(2), 
            icon: <TrendingUp className="w-6 h-6" />,
            color: "from-edusync-accent to-purple-600",
            bgColor: "bg-edusync-accent/10"
          },
          { 
            label: "Achievements", 
            value: profile.achievements.length, 
            icon: <Award className="w-6 h-6" />,
            color: "from-yellow-500 to-orange-500",
            bgColor: "bg-yellow-100"
          },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-6 border border-gray-200/50 hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-6 border border-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-edusync-primary/10 rounded-xl flex items-center justify-center">
              <List className="w-5 h-5 text-edusync-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          </div>
          
          <div className="space-y-3">
            {profile.recentActivity.length > 0 ? (
              profile.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-xl hover:bg-edusync-primary/5 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-edusync-primary/20 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-edusync-primary rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">{activity}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <List className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Security & Social */}
        <div className="space-y-6">
          {/* Security Settings */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-6 border border-gray-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Security</h2>
            </div>
            
            <button className="flex items-center gap-3 w-full p-4 bg-gray-50/80 rounded-xl hover:bg-red-50 transition-colors duration-200 group">
              <Lock className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
              <span className="text-gray-700 group-hover:text-red-700">Change Password</span>
            </button>
          </div>

          {/* Social Links */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-6 border border-gray-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Social Links</h2>
            </div>
            
            <div className="space-y-3">
              {profile.socialLinks.length > 0 ? (
                profile.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-xl hover:bg-blue-50 transition-colors duration-200 group"
                  >
                    <LinkIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-gray-700 group-hover:text-blue-700 truncate">{link}</span>
                  </a>
                ))
              ) : (
                <div className="text-center py-6">
                  <LinkIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No social links added</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-soft p-6 border border-gray-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Achievements</h2>
        </div>
        
        {profile.achievements.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {profile.achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border border-yellow-200/50 animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800 font-medium text-sm">{achievement}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No achievements yet</p>
            <p className="text-gray-400 text-sm">Keep learning to unlock achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
}
