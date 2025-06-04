
import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
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
  status: string;
  avatarUrl?: string;
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
    </div>
  );
}
