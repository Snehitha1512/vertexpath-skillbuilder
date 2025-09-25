import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle, 
  Circle, 
  Play,
  ChevronRight,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  full_name: string;
  target_job: string;
  skills: string;
  experience_years: string;
  industry: string;
}

interface LearningPath {
  level: number;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  courses: {
    title: string;
    provider: string;
    duration: string;
    difficulty: string;
    completed: boolean;
    progress?: number;
  }[];
  progress: number;
  completed: boolean;
}

const PersonalizedRoadmap: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

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
    const mockPaths: LearningPath[] = [
      {
        level: 1,
        title: "Foundation Building",
        description: "Master the fundamentals and build a strong base",
        duration: "4-6 weeks",
        skills: ["JavaScript Basics", "HTML/CSS", "Git Basics"],
        courses: [
          {
            title: "JavaScript Fundamentals",
            provider: "FreeCodeCamp",
            duration: "20 hours",
            difficulty: "Beginner",
            completed: true,
            progress: 100
          },
          {
            title: "HTML & CSS Masterclass",
            provider: "Udemy",
            duration: "15 hours", 
            difficulty: "Beginner",
            completed: true,
            progress: 100
          },
          {
            title: "Git & GitHub Basics",
            provider: "GitHub Learning Lab",
            duration: "8 hours",
            difficulty: "Beginner",
            completed: false,
            progress: 75
          }
        ],
        progress: 92,
        completed: false
      },
      {
        level: 2,
        title: "Framework Mastery",
        description: "Learn modern frameworks and tools",
        duration: "6-8 weeks",
        skills: ["React", "Node.js", "API Development"],
        courses: [
          {
            title: "React - The Complete Guide",
            provider: "Udemy",
            duration: "40 hours",
            difficulty: "Intermediate",
            completed: false,
            progress: 60
          },
          {
            title: "Node.js Backend Development",
            provider: "Coursera",
            duration: "25 hours",
            difficulty: "Intermediate", 
            completed: false,
            progress: 30
          },
          {
            title: "REST API Design",
            provider: "Pluralsight",
            duration: "12 hours",
            difficulty: "Intermediate",
            completed: false,
            progress: 0
          }
        ],
        progress: 45,
        completed: false
      },
      {
        level: 3,
        title: "Advanced Skills",
        description: "Develop expertise in specialized areas",
        duration: "8-10 weeks",
        skills: ["AWS", "Docker", "System Design"],
        courses: [
          {
            title: "AWS Solutions Architect",
            provider: "A Cloud Guru",
            duration: "35 hours",
            difficulty: "Advanced",
            completed: false,
            progress: 0
          },
          {
            title: "Docker & Kubernetes",
            provider: "Linux Academy",
            duration: "20 hours",
            difficulty: "Advanced",
            completed: false,
            progress: 0
          },
          {
            title: "System Design Fundamentals",
            provider: "Educative",
            duration: "18 hours",
            difficulty: "Advanced",
            completed: false,
            progress: 0
          }
        ],
        progress: 0,
        completed: false
      },
      {
        level: 4,
        title: "Specialization",
        description: "Deep dive into your target role specifics",
        duration: "6-8 weeks",
        skills: ["Machine Learning", "Data Analytics", "Project Management"],
        courses: [
          {
            title: "Machine Learning A-Z",
            provider: "Udemy",
            duration: "44 hours",
            difficulty: "Advanced",
            completed: false,
            progress: 0
          },
          {
            title: "Data Analysis with Python",
            provider: "DataCamp",
            duration: "30 hours",
            difficulty: "Intermediate",
            completed: false,
            progress: 0
          },
          {
            title: "Agile Project Management",
            provider: "Coursera",
            duration: "15 hours",
            difficulty: "Intermediate",
            completed: false,
            progress: 0
          }
        ],
        progress: 0,
        completed: false
      }
    ];

    setLearningPaths(mockPaths);
    
    // Calculate overall progress
    const totalProgress = mockPaths.reduce((sum, path) => sum + path.progress, 0);
    const avgProgress = totalProgress / mockPaths.length;
    setOverallProgress(Math.round(avgProgress));

    // Set active step based on current progress
    const activeIndex = mockPaths.findIndex(path => !path.completed && path.progress < 100);
    setActiveStep(activeIndex === -1 ? mockPaths.length - 1 : activeIndex);
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
          <p className="text-gray-300">Please complete your profile to access personalized roadmap.</p>
          <Button onClick={() => window.location.hash = "profile"}>
            Complete Profile
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-dark pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Learning Roadmap
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Personalized path to become a <span className="text-primary font-medium">{profile.target_job}</span>
          </p>
          
          {/* Overall Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Overall Progress</span>
              <span className="text-sm text-primary font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative mb-16">
          {/* Timeline Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-600 transform -translate-y-1/2 hidden md:block">
            <div 
              className="h-full bg-gradient-primary transition-all duration-1000 ease-in-out"
              style={{ width: `${(activeStep / (learningPaths.length - 1)) * 100}%` }}
            />
          </div>

          {/* Timeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {learningPaths.map((path, index) => {
              const isActive = index === activeStep;
              const isCompleted = path.completed || path.progress === 100;
              const isPrevious = index < activeStep;
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "relative transition-all duration-500 ease-in-out transform hover:scale-105",
                    isActive && "animate-pulse"
                  )}
                >
                  {/* Timeline Node */}
                  <div className="flex justify-center mb-4 md:mb-8">
                    <div
                      className={cn(
                        "relative w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300",
                        isCompleted 
                          ? "bg-green-500 border-green-500 text-white" 
                          : isActive
                          ? "bg-primary border-primary text-white"
                          : "bg-gray-700 border-gray-600 text-gray-400"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <span className="font-bold">{path.level}</span>
                      )}
                      
                      {/* Pulse animation for active step */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
                      )}
                    </div>
                  </div>

                  {/* Timeline Card */}
                  <Card 
                    className={cn(
                      "bg-white/5 border-white/10 backdrop-blur transition-all duration-300 hover:bg-white/10",
                      isActive && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Target className={cn("h-4 w-4", isActive ? "text-primary" : "text-gray-400")} />
                        {path.title}
                      </CardTitle>
                      <p className="text-gray-300 text-sm">{path.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {path.duration}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-300">Progress</span>
                          <span className="text-xs text-primary font-medium">{path.progress}%</span>
                        </div>
                        <Progress 
                          value={path.progress} 
                          className="h-2"
                        />
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <p className="text-xs text-gray-300">Key Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {path.skills.map((skill, skillIndex) => (
                            <Badge 
                              key={skillIndex}
                              variant="secondary"
                              className="text-xs bg-primary/20 text-white border-primary/30"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Courses Preview */}
                      <div className="space-y-2">
                        <p className="text-xs text-gray-300">Courses ({path.courses.length}):</p>
                        <div className="space-y-1">
                          {path.courses.slice(0, 2).map((course, courseIndex) => (
                            <div key={courseIndex} className="flex items-center gap-2 text-xs">
                              {course.completed ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : course.progress && course.progress > 0 ? (
                                <Circle className="h-3 w-3 text-yellow-500" />
                              ) : (
                                <Circle className="h-3 w-3 text-gray-500" />
                              )}
                              <span className="text-gray-300 truncate">{course.title}</span>
                              {course.progress && course.progress > 0 && !course.completed && (
                                <span className="text-primary text-xs ml-auto">
                                  {course.progress}%
                                </span>
                              )}
                            </div>
                          ))}
                          {path.courses.length > 2 && (
                            <p className="text-xs text-gray-400">+{path.courses.length - 2} more</p>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      {isActive && (
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-primary hover:opacity-90 animate-fade-in"
                          onClick={() => window.location.hash = "courses"}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Continue Learning
                        </Button>
                      )}
                      
                      {isPrevious && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10"
                          disabled
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Button>
                      )}

                      {!isActive && !isPrevious && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="w-full text-gray-400 hover:text-white hover:bg-white/5"
                          disabled
                        >
                          <ChevronRight className="h-3 w-3 mr-1" />
                          Coming Soon
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed View of Current Level */}
        {learningPaths[activeStep] && (
          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Current Focus: {learningPaths[activeStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningPaths[activeStep].courses.map((course, index) => (
                  <Card key={index} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-white text-sm">{course.title}</h4>
                          {course.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-300">
                          <div className="flex justify-between">
                            <span>Provider:</span>
                            <span className="text-primary">{course.provider}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Level:</span>
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              {course.difficulty}
                            </Badge>
                          </div>
                        </div>

                        {course.progress !== undefined && course.progress > 0 && !course.completed && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-300">Progress</span>
                              <span className="text-primary">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-1" />
                          </div>
                        )}

                        <Button 
                          size="sm" 
                          className="w-full"
                          variant={course.completed ? "outline" : "default"}
                        >
                          {course.completed ? "Review" : course.progress ? "Continue" : "Start Course"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default PersonalizedRoadmap;