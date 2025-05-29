
import { useState } from "react";
import { BookOpen, Users, BarChart2, Calendar } from "lucide-react";

const Index = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const stats = [
    {
      title: "Active Courses",
      value: "12",
      change: "+2.5%",
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-edusync-primary to-edusync-secondary"
    },
    {
      title: "Total Students",
      value: "1,247",
      change: "+12.3%",
      icon: <Users className="h-6 w-6" />,
      color: "from-edusync-accent to-purple-600"
    },
    {
      title: "Avg. Performance",
      value: "87.5%",
      change: "+5.2%",
      icon: <BarChart2 className="h-6 w-6" />,
      color: "from-edusync-success to-green-600"
    },
    {
      title: "Events This Week",
      value: "8",
      change: "+1",
      icon: <Calendar className="h-6 w-6" />,
      color: "from-edusync-warning to-orange-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-edusync-primary via-edusync-secondary to-edusync-accent p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 animate-fade-in">
            Welcome to EduSync Platform
          </h1>
          <p className="text-xl opacity-90 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Your comprehensive educational management system with enhanced UI and modern design principles.
          </p>
        </div>
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12">
          <div className="w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl bg-white border border-gray-200/50 p-6 shadow-soft transition-all duration-300 hover:shadow-elevation cursor-pointer transform hover:-translate-y-1 ${
              activeCard === index ? 'ring-2 ring-edusync-primary/20' : ''
            }`}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-edusync-success mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white transform transition-transform duration-200 ${
                activeCard === index ? 'scale-110' : ''
              }`}>
                {stat.icon}
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.color} transition-all duration-300 ${
              activeCard === index ? 'w-full' : 'w-0'
            }`}></div>
          </div>
        ))}
      </div>

      {/* Feature Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-soft hover:shadow-elevation transition-all duration-300">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Enhanced UI Experience
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-edusync-primary rounded-full"></div>
              Glassmorphism effects and backdrop blur
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-edusync-secondary rounded-full"></div>
              Smooth animations and micro-interactions
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-edusync-accent rounded-full"></div>
              Modern gradient designs and shadows
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-edusync-success rounded-full"></div>
              Responsive layout with mobile-first approach
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-soft hover:shadow-elevation transition-all duration-300">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Key Features
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-edusync-warning rounded-full"></div>
              Advanced notification system
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-edusync-error rounded-full"></div>
              Role-based navigation (Admin/Student)
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Collapsible sidebar with smooth transitions
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Search functionality with focus states
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
