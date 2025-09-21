import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Lightbulb,
  BookOpen
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  target_job: string;
  skills: string;
  experience_years: string;
  industry: string;
}

interface SkillAnalysis {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

const Analysis: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAnalysisData();
    }
  }, [user]);

  const fetchAnalysisData = async () => {
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
        generateSkillAnalysis(profileData);
      }
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSkillAnalysis = (profileData: Profile) => {
    // Mock skill analysis based on target job
    const mockAnalysis: SkillAnalysis[] = [
      { skill: 'JavaScript', currentLevel: 75, targetLevel: 90, gap: 15, priority: 'high' },
      { skill: 'React', currentLevel: 60, targetLevel: 85, gap: 25, priority: 'high' },
      { skill: 'Python', currentLevel: 80, targetLevel: 80, gap: 0, priority: 'low' },
      { skill: 'SQL', currentLevel: 55, targetLevel: 80, gap: 25, priority: 'medium' },
      { skill: 'AWS', currentLevel: 30, targetLevel: 70, gap: 40, priority: 'high' },
      { skill: 'Docker', currentLevel: 40, targetLevel: 75, gap: 35, priority: 'medium' },
    ];

    setSkillGaps(mockAnalysis);
    
    // Calculate overall score
    const totalCurrent = mockAnalysis.reduce((sum, skill) => sum + skill.currentLevel, 0);
    const totalTarget = mockAnalysis.reduce((sum, skill) => sum + skill.targetLevel, 0);
    const score = Math.round((totalCurrent / totalTarget) * 100);
    setOverallScore(score);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16 flex items-center justify-center">
        <div className="text-foreground text-xl">Analyzing your skills...</div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Complete Your Profile</h2>
          <p className="text-muted-foreground">Please complete your profile to access skill analysis.</p>
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
            Skill Gap Analysis
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            AI-powered insights into your current skills vs target role requirements
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Overall Match</p>
                  <p className="text-2xl font-bold text-foreground">{overallScore}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <Progress value={overallScore} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Skills to Improve</p>
                  <p className="text-2xl font-bold text-foreground">
                    {skillGaps.filter(s => s.gap > 0).length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">High Priority</p>
                  <p className="text-2xl font-bold text-foreground">
                    {skillGaps.filter(s => s.priority === 'high').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Skills Mastered</p>
                  <p className="text-2xl font-bold text-foreground">
                    {skillGaps.filter(s => s.gap === 0).length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skill Gap Details */}
          <div className="lg:col-span-2">
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Detailed Skill Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {skillGaps.map((skill, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{skill.skill}</h4>
                        <div className={`flex items-center gap-1 ${getPriorityColor(skill.priority)}`}>
                          {getPriorityIcon(skill.priority)}
                          <span className="text-xs capitalize">{skill.priority}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {skill.currentLevel}% → {skill.targetLevel}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current Level</span>
                        <span>Target Level</span>
                      </div>
                      <div className="relative">
                        <Progress value={skill.targetLevel} className="h-2 opacity-30" />
                        <Progress 
                          value={skill.currentLevel} 
                          className="h-2 absolute top-0" 
                        />
                      </div>
                    </div>
                    
                    {skill.gap > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Gap: {skill.gap} points to reach target level
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Focus on High Priority</h4>
                  <p className="text-sm text-muted-foreground">
                    Start with AWS and React skills as they have the largest gaps for your target role.
                  </p>
                </div>
                
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Leverage Strengths</h4>
                  <p className="text-sm text-muted-foreground">
                    Your Python skills are already at target level. Consider advanced certifications.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-500/10 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Estimated Timeline</h4>
                  <p className="text-sm text-muted-foreground">
                    With consistent learning, you can close critical gaps in 3-4 months.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => window.location.hash = "courses"}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Find Relevant Courses
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.hash = "roadmap"}>
                  <Target className="h-4 w-4 mr-2" />
                  View Learning Path
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Resume
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analysis;