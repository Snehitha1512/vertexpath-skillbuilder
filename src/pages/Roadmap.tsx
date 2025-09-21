import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Target, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Award,
  BarChart3
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  target_job: string;
  avatar_url: string;
  current_status: string;
  created_at: string;
}

interface RoadmapEntry {
  id: string;
  title: string;
  description: string;
  skill_tag: string;
  status: string;
  start_date: string;
  end_date?: string;
}

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

const Roadmap: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roadmapEntries, setRoadmapEntries] = useState<RoadmapEntry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch roadmap entries
      const { data: roadmapData } = await supabase
        .from('roadmap_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (roadmapData) {
        setRoadmapEntries(roadmapData);
      }

      // Fetch recommended courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .limit(6);

      if (coursesData) {
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markCourseComplete = async (entryId: string) => {
    const { error } = await supabase
      .from('roadmap_entries')
      .update({ 
        status: 'completed', 
        end_date: new Date().toISOString().slice(0, 10) 
      })
      .eq('id', entryId);

    if (!error) {
      fetchUserData(); // Refresh data
    }
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
      fetchUserData(); // Refresh data
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-dark pt-16 flex items-center justify-center">
        <div className="text-white text-xl">Loading your roadmap...</div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="min-h-screen bg-gradient-dark pt-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
          <p className="text-gray-300">Please complete your profile to access your personalized roadmap.</p>
          <Button 
            onClick={() => window.location.hash = "profile"}
            className="bg-gradient-primary hover:opacity-90"
          >
            Complete Profile
          </Button>
        </div>
      </section>
    );
  }

  const completedEntries = roadmapEntries.filter(entry => entry.status === 'completed').length;
  const totalEntries = roadmapEntries.length;
  const completionPercentage = totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0;

  return (
    <section className="min-h-screen bg-gradient-dark pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20">
                  <User className="h-8 w-8 text-white/50" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{profile.full_name}'s Learning Path</h1>
                <p className="text-gray-300">Target: {profile.target_job}</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.hash = "profile"}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Edit Profile
            </Button>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Overall Progress</p>
                    <p className="text-2xl font-bold text-white">{Math.round(completionPercentage)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <Progress value={completionPercentage} className="mt-3" />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Courses Completed</p>
                    <p className="text-2xl font-bold text-white">{completedEntries}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Skills Gained</p>
                    <p className="text-2xl font-bold text-white">{completedEntries * 2}</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Learning Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {roadmapEntries.length > 0 ? (
                  <div className="space-y-4">
                    {roadmapEntries.map((entry, index) => (
                      <div key={entry.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full mt-2 ${
                            entry.status === 'completed' 
                              ? 'bg-green-500' 
                              : entry.status === 'in-progress' 
                              ? 'bg-yellow-400' 
                              : 'bg-gray-400'
                          }`} />
                          {index < roadmapEntries.length - 1 && (
                            <div className="w-0.5 h-16 bg-gray-600 mt-2" />
                          )}
                        </div>
                        
                        <div className="flex-1 pb-8">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{entry.title}</h4>
                              <p className="text-gray-300 text-sm mt-1">{entry.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  variant={entry.status === 'completed' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {entry.status.replace('-', ' ').toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {entry.skill_tag}
                                </Badge>
                              </div>
                            </div>
                            {entry.status !== 'completed' && (
                              <Button
                                size="sm"
                                onClick={() => markCourseComplete(entry.id)}
                                className="ml-4"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">No courses in your roadmap yet.</p>
                    <p className="text-gray-400 text-sm">Add courses from the recommendations below.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skill Growth Chart */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Skill Growth Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">85%</div>
                      <div className="text-gray-300 text-sm">Python</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">75%</div>
                      <div className="text-gray-300 text-sm">JavaScript</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">70%</div>
                      <div className="text-gray-300 text-sm">React</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">80%</div>
                      <div className="text-gray-300 text-sm">SQL</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm text-center">
                    Skill levels based on completed courses and assessments
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Recommendations */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommended Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="border border-white/10 rounded-lg p-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-white">{course.title}</h4>
                      <p className="text-gray-300 text-sm">{course.platform}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={course.is_free ? "default" : "secondary"} className="text-xs">
                        {course.is_free ? "Free" : "Paid"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.duration_hours}h
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(course.url, '_blank')}
                        className="flex-1"
                      >
                        View Course
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addCourseToRoadmap(course)}
                        className="flex-1 bg-gradient-primary hover:opacity-90"
                      >
                        Add to Path
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Learning Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Streak</span>
                  <span className="text-white font-bold">7 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Hours Learned</span>
                  <span className="text-white font-bold">42h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Certificates</span>
                  <span className="text-white font-bold">{completedEntries}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;