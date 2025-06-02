
import React, { useState, useEffect } from "react";
import { Search, Calendar as CalendarIcon, Table, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import api from "../../services/api";

interface ScheduleDTO {
  date: string;
  day: string;
  time: string;
  subject: string; 
  room: string;
  doctor: string;
}

const subjectColors: Record<string, string> = {
  "Web Development": "bg-blue-500",
  "Data Structures": "bg-green-500",
  "Networking": "bg-yellow-500",
  "Database": "bg-purple-500",
  "Mathematics": "bg-red-500",
  "Physics": "bg-indigo-500",
  "Chemistry": "bg-pink-500",
  "English": "bg-orange-500",
};

const getSubjectColor = (subject: string) => {
  return subjectColors[subject] || "bg-gray-500";
};

export default function SchedulePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [schedule, setSchedule] = useState<ScheduleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const stored = localStorage.getItem("eduSyncUser");
        if (!stored) throw new Error("You are not logged in.");

        const { id: studentId, token } = JSON.parse(stored);
        if (!studentId) throw new Error("Missing user ID or token.");

        const { data } = await api.get<ScheduleDTO[]>(
          `/api/courseschedule/mine/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSchedule(
          data.map((cls) => ({
            ...cls,
            date: cls.date.split("T")[0],
          }))
        );
      } catch (err: any) {
        console.error("Schedule fetch error:", err);
        setError(err.message || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  const getClassesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedule.filter(cls => cls.date === dateStr);
  };

  const getClassesForSelectedDate = () => {
    return getClassesForDate(selectedDate);
  };

  const filteredSchedule = schedule.filter((cls) => {
    const matchesSearch =
      cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 1 })
  });

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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600">
          <h2 className="text-xl font-semibold mb-2">Error Loading Schedule</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-600 mt-1">Manage your academic timetable</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-edusync-primary focus:border-transparent outline-none"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="flex items-center gap-2"
            >
              <Table className="h-4 w-4" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-lg font-semibold">
                    Week of {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM d, yyyy")}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(day => {
                    const classes = getClassesForDate(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          isSelected 
                            ? 'ring-2 ring-edusync-primary bg-edusync-primary/5' 
                            : isToday 
                            ? 'bg-edusync-primary/10 border-edusync-primary' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className={`text-sm font-medium mb-2 ${
                          isToday ? 'text-edusync-primary' : 'text-gray-700'
                        }`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {classes.slice(0, 3).map((cls, idx) => (
                            <div
                              key={idx}
                              className={`text-xs p-1 rounded text-white truncate ${getSubjectColor(cls.subject)}`}
                              title={`${cls.subject} at ${cls.time}`}
                            >
                              {cls.time.split('-')[0]} {cls.subject}
                            </div>
                          ))}
                          {classes.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{classes.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Day Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(selectedDate, "EEEE, MMM d")}
                </CardTitle>
                <CardDescription>
                  {getClassesForSelectedDate().length} class(es) scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getClassesForSelectedDate().length > 0 ? (
                    getClassesForSelectedDate().map((cls, idx) => (
                      <div key={idx} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{cls.subject}</h4>
                          <Badge variant="secondary" className={`${getSubjectColor(cls.subject)} text-white`}>
                            {cls.day}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {cls.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {cls.room}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {cls.doctor}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No classes scheduled for this day</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardHeader>
            <CardTitle>Schedule Table</CardTitle>
            <CardDescription>
              Complete overview of all your classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableComponent>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Instructor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedule.map((cls, i) => {
                  const isToday = isSameDay(parseISO(cls.date), new Date());
                  
                  return (
                    <TableRow 
                      key={i} 
                      className={isToday ? "bg-edusync-primary/5" : ""}
                    >
                      <TableCell className="font-medium">
                        {format(parseISO(cls.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cls.day}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {cls.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getSubjectColor(cls.subject)}`}></div>
                          <span className="font-medium">{cls.subject}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {cls.room}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {cls.doctor}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </TableComponent>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
