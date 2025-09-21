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
  BarChart3,
  Star,
  Play
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  target_job: string;
  avatar_url: string;
  current_status: string;
  created_at: string;
}

interface LearningPath {
  level: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  courses: { name: string; platform: string; completed: boolean; }[];
  progress: number;
}

const PersonalizedRoadmap: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        generatePersonalizedPaths(profileData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedPaths = (profileData: Profile) => {
    // Generate personalized learning paths based on target job
    const mockPaths: LearningPath[] = [
      {
        level: "Beginner",
        title: "Foundation Skills",
        description: "Build strong fundamentals in programming and web development",
        duration: "3-4 months",
        skills: ["HTML/CSS", "JavaScript Basics", "Git/GitHub", "Problem Solving"],
        courses: [
          { name: "HTML & CSS Fundamentals", platform: "freeCodeCamp", completed: true },
          { name: "JavaScript Basics", platform: "Codecademy", completed: true },
          { name: "Git & GitHub Essentials", platform: "Udemy", completed: false },
          { name: "Introduction to Programming", platform: "Coursera", completed: false }
        ],
        progress: 65
      },
      {
        level: "Intermediate", 
        title: "Core Development",
        description: "Master essential frameworks and development practices",
        duration: "4-6 months",
        skills: ["React", "Node.js", "Databases", "REST APIs", "Testing"],
        courses: [
          { name: "React Complete Guide", platform: "Udemy", completed: false },
          { name: "Node.js Backend Development", platform: "Pluralsight", completed: false },
          { name: "Database Design & SQL", platform: "edX", completed: false },
          { name: "API Development", platform: "Frontend Masters", completed: false }
        ],
        progress: 25
      },
      {
        level: "Advanced",
        title: "Professional Excellence", 
        description: "Advanced concepts and industry best practices",
        duration: "6-8 months",
        skills: ["System Design", "Cloud Services", "DevOps", "Performance", "Security"],
        courses: [
          { name: "System Design Interview", platform: "Educative", completed: false },
          { name: "AWS Cloud Practitioner", platform: "AWS", completed: false },
          { name: "Docker & Kubernetes", platform: "Docker", completed: false },
          { name: "Web Security Fundamentals", platform: "OWASP", completed: false }
        ],
        progress: 0
      }
    ];

    setLearningPaths(mockPaths);
    
    // Calculate overall progress
    const totalProgress = mockPaths.reduce((sum, path) => sum + path.progress, 0);
    setOverallProgress(Math.round(totalProgress / mockPaths.length));
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16 flex items-center justify-center">
        <div className="text-foreground text-xl">Loading your personalized roadmap...</div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Complete Your Profile</h2>
          <p className="text-muted-foreground">Please complete your profile to access your personalized roadmap.</p>
          <Button onClick={() => window.location.hash = "profile"}>
            Complete Profile
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Learning Roadmap
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Personalized learning path from beginner to expert in {profile.target_job}
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="bg-card/80 backdrop-blur border-border/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Overall Progress</h3>
                <p className="text-muted-foreground">Your journey to becoming a {profile.target_job}</p>
              </div>
              <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Learning Paths */}
        <div className="space-y-8">
          {learningPaths.map((path, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      path.level === 'Beginner' ? 'bg-green-500/20 text-green-600' :
                      path.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-600' :
                      'bg-red-500/20 text-red-600'
                    }`}>
                      {path.level === 'Beginner' ? '🌱' : path.level === 'Intermediate' ? '🚀' : '⭐'}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{path.level}: {path.title}</CardTitle>
                      <p className="text-muted-foreground">{path.description}</p>
                    </div>
                  </div>
                  <Badge variant={path.progress > 0 ? 'default' : 'secondary'}>
                    {path.duration}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{path.progress}%</span>
                  </div>
                  <Progress value={path.progress} />
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Skills You'll Learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {path.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Courses */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Recommended Courses</h4>
                  <div className="grid gap-3">
                    {path.courses.map((course, courseIndex) => (
                      <div key={courseIndex} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            course.completed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                          }`}>
                            {course.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{course.name}</p>
                            <p className="text-sm text-muted-foreground">{course.platform}</p>
                          </div>
                        </div>
                        {!course.completed && (
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonalizedRoadmap;