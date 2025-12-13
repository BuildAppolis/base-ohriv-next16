'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, TrendingUp, Users, Brain, Zap } from 'lucide-react';

interface FunFact {
  id: string;
  fact: string;
  category: string;
  icon: string;
}

const CATEGORIES = [
  { name: 'History', icon: '📚' },
  { name: 'Statistics', icon: '📊' },
  { name: 'Recruitment', icon: '🎯' },
  { name: 'Future', icon: '🔮' },
  { name: 'Culture', icon: '🌍' }
];

// Import server action for AI generation
import { generateStreamingResponse } from './_actions/generate-stream';

export default function TestStreamPage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [facts, setFacts] = useState<FunFact[]>([]);
  const [streamProgress, setStreamProgress] = useState({ current: 0, total: 10 });

  const generateAIStreamingFacts = async () => {
    setIsStreaming(true);
    setFacts([]);
    setStreamProgress({ current: 0, total: 10 });

    try {
      // Generate 10 fun facts using real AI streaming
      for (let i = 0; i < 10; i++) {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

        // Generate a fact for this category

        // Use server action to generate AI response
        const prompt = `Generate one interesting, surprising, or educational fun fact about the job industry, careers, recruitment, or the future of work. Make it concise (under 200 characters) and engaging. Focus on ${category.name.toLowerCase()} if possible. Just provide the fact directly without any introduction or numbering.`;

        const result = await generateStreamingResponse(prompt);

        if (!result.success) {
          throw new Error(result.error || 'Failed to generate response');
        }

        // Add the completed fact to the list immediately (no typewriter effect)
        const newFact: FunFact = {
          id: `fact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          fact: (result.text ?? '').trim(),
          category: category.name,
          icon: category.icon
        };

        setFacts(prev => [...prev, newFact]);
        setStreamProgress({ current: i + 1, total: 10 });

        // Small pause between facts for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error generating AI streaming facts:', error);
      // Fallback to a default fact if AI fails
      const fallbackFact: FunFact = {
        id: `fact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        fact: "AI streaming temporarily unavailable. This is a test fallback fact.",
        category: "System",
        icon: "⚙️"
      };
      setFacts([fallbackFact]);
    }

    // Clear streaming state
    setIsStreaming(false);
  };

  const resetStream = () => {
    setIsStreaming(false);
    setFacts([]);
    setStreamProgress({ current: 0, total: 10 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Controls */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Streaming Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={generateAIStreamingFacts}
                  disabled={isStreaming}
                  size="lg"
                  className="relative"
                >
                  {isStreaming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate 10 Job Industry Fun Facts with AI
                    </>
                  )}
                </Button>

                {facts.length > 0 && !isStreaming && (
                  <Button
                    onClick={resetStream}
                    variant="outline"
                    size="lg"
                  >
                    Reset
                  </Button>
                )}
              </div>

              {/* Progress */}
              {isStreaming && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Generating facts...</span>
                    <span className="font-medium">
                      {streamProgress.current} / {streamProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${(streamProgress.current / streamProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streaming Status */}
          {isStreaming && (
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="h-5 w-5" />
                  Generating AI Fun Facts...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Generated {streamProgress.current} of {streamProgress.total} facts
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Facts */}
          {facts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Generated Fun Facts
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {facts.length} fascinating facts about the job industry
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {facts.map((fact, index) => (
                      <div
                        key={fact.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0 mt-1">{fact.icon}</span>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{fact.category}</Badge>
                              <span className="text-sm text-muted-foreground">#{index + 1}</span>
                            </div>
                            <p className="text-base leading-relaxed">{fact.fact}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}