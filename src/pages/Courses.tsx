import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  Star,
  ExternalLink,
  Play
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  platform: string;
  url: string;
  is_free: boolean;
  difficulty: string;
  duration_hours: number;
  skill_tags: string[];
}

const Courses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedDifficulty, selectedType]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('title');

      if (coursesData) {
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.skill_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(course => 
        selectedType === "free" ? course.is_free : !course.is_free
      );
    }

    setFilteredCourses(filtered);
  };

  const addCourseToRoadmap = async (course: Course) => {
    if (!user) return;

    const { error } = await supabase
      .from('roadmap_entries')
      .insert({
        user_id: user.id,
        title: course.title,
        description: `Learn ${course.title} on ${course.platform}`,
        skill_tag: course.skill_tags[0] || 'general',
        status: 'planned',
        start_date: new Date().toISOString().slice(0, 10),
      });

    if (!error) {
      // Could add toast notification here
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16 flex items-center justify-center">
        <div className="text-foreground text-xl">Loading courses...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Course Library
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover curated courses from top platforms to advance your skills
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-md border bg-background text-foreground"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-md border bg-background text-foreground"
          >
            <option value="all">All Types</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid Only</option>
          </select>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="bg-card/80 backdrop-blur border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <Badge variant={course.is_free ? "default" : "secondary"} className="text-xs">
                    {course.is_free ? "Free" : "Paid"}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{course.platform}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration_hours}h
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {course.difficulty}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1">
                  {course.skill_tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {course.skill_tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{course.skill_tags.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(course.url, '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Course
                  </Button>
                  {user && (
                    <Button
                      size="sm"
                      onClick={() => addCourseToRoadmap(course)}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Add to Path
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Courses;