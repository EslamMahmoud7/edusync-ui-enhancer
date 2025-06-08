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
      setLoading(true);
      setError(null);
      try {
        const stored = localStorage.getItem("eduSyncUser");
        if (!stored) throw new Error("You are not logged in.");

        const { id: studentId, token } = JSON.parse(stored);
        if (!studentId) throw new Error("Missing user ID or token.");

        const { data: apiData } = await api.get<ScheduleDTO[]>(
          `/api/courseschedule/student/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const expandedSchedule: ScheduleDTO[] = [];
        apiData.forEach((baseClass) => {
          const initialDateString = baseClass.date.split("T")[0];
          const initialDate = parseISO(initialDateString);

          for (let weekOffset = 0; weekOffset < 12; weekOffset++) {
            const eventDate = addWeeks(initialDate, weekOffset);
            expandedSchedule.push({
              ...baseClass,
              date: format(eventDate, "yyyy-MM-dd"), 
            });
          }
        });

        setSchedule(expandedSchedule);
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
    return schedule.filter(cls => {
      const matchesDate = cls.date === dateStr;
      const matchesSearch =
        cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.doctor.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    });
  };

  const getClassesForSelectedDate = () => {
    return getClassesForDate(selectedDate);
  };

  const filteredScheduleForTable = schedule.filter((cls) => {
    const matchesSearch =
      cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || a.time.localeCompare(b.time));

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
      <div className="space-y-8 p-4 md:p-6">
        <Card className="border-red-200 bg-red-50">
            <CardHeader>
                <CardTitle className="text-red-700">Error Loading Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-red-600">{error}</p>
                <Button onClick={() => { /* Consider adding a refetch mechanism */ }} className="mt-4">
                    Try Again
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Class Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your academic timetable for the next 12 weeks.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-edusync-primary focus:border-transparent outline-none w-full bg-white dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 ${viewMode === "calendar" ? 'bg-edusync-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 ${viewMode === "table" ? 'bg-edusync-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <Table className="h-4 w-4" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800">
              <CardHeader className="pb-4 px-0 sm:px-2">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="icon" 
                    onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                    className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
                    Week of {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM d, yyyy")}
                  </h3>
                  <Button
                    variant="outline"
                    size="icon" 
                    onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                    className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0 sm:px-2">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {weekDays.map(day => {
                    const classes = getClassesForDate(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 border dark:border-gray-700 rounded-lg cursor-pointer transition-all hover:shadow-md 
                        ${ isSelected 
                            ? 'ring-2 ring-edusync-primary bg-edusync-primary/10 dark:bg-edusync-primary/20' 
                            : isToday 
                            ? 'bg-edusync-primary/5 dark:bg-edusync-primary/10 border-edusync-primary' 
                            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50'
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-center sm:text-left ${
                          isToday ? 'text-edusync-primary font-bold' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {classes.slice(0, 2).map((cls, idx) => (
                            <div
                              key={idx}
                              className={`text-[10px] sm:text-xs p-1 rounded text-white truncate ${getSubjectColor(cls.subject)}`}
                              title={`${cls.subject} at ${cls.time.split('-')[0]}`}
                            >
                              {cls.time.split('-')[0]} {cls.subject}
                            </div>
                          ))}
                          {classes.length > 2 && (
                            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              +{classes.length - 2} more
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

          <div className="lg:col-span-1">
            <Card className="sticky top-6 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CalendarIcon className="h-5 w-5 text-edusync-primary" />
                  {format(selectedDate, "EEEE, MMM d")}
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  {getClassesForSelectedDate().length} class(es) scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                  {getClassesForSelectedDate().length > 0 ? (
                    getClassesForSelectedDate().map((cls, idx) => (
                      <div key={idx} className="p-3 sm:p-4 border dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{cls.subject}</h4>
                          <Badge variant="secondary" className={`${getSubjectColor(cls.subject)} text-white text-xs`}>
                            {cls.day}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No classes scheduled for this day{searchTerm && ' matching your search'}.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Schedule Table</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Complete overview of all your classes for the next 12 weeks (filtered by search).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <TableComponent className="min-w-full">
              <TableHeader>
                <TableRow className="dark:border-gray-700">
                  <TableHead className="dark:text-gray-300">Date</TableHead>
                  <TableHead className="dark:text-gray-300">Day</TableHead>
                  <TableHead className="dark:text-gray-300">Time</TableHead>
                  <TableHead className="dark:text-gray-300">Subject</TableHead>
                  <TableHead className="dark:text-gray-300">Room</TableHead>
                  <TableHead className="dark:text-gray-300">Instructor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScheduleForTable.length > 0 ? (
                  filteredScheduleForTable.map((cls, i) => {
                  const isToday = isSameDay(parseISO(cls.date), new Date());
                  
                  return (
                    <TableRow 
                      key={`${cls.date}-${cls.time}-${cls.subject}-${i}`} // More unique key
                      className={`${isToday ? "bg-edusync-primary/5 dark:bg-edusync-primary/10" : "dark:border-gray-700"} hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                    >
                      <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                        {format(parseISO(cls.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{cls.day}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {cls.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getSubjectColor(cls.subject)}`}></div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{cls.subject}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {cls.room}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {cls.doctor}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No classes found{searchTerm && ' matching your search criteria'}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableComponent>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}