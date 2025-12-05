'use client';

import { HelpCircle, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CompanyDescriptionGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Company Description Guide</DialogTitle>
          <DialogDescription>
            Best practices for writing a clear, detailed company description
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Format Section */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                Recommended Format
              </h3>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                    🎯 Company Mission
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    What is your company&apos;s purpose? What problem do you solve?
                  </p>
                </div>
                <div>
                  <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                    💎 Company Values
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    What principles guide your work? What do you believe in?
                  </p>
                </div>
                <div>
                  <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                    🏢 Company Overview
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Team size, industry, stage, business model, and technologies you use
                  </p>
                </div>
              </div>
            </section>

            {/* Good Example */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                ✅ Great Example
              </h3>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-xs text-green-900 dark:text-green-100 whitespace-pre-line font-mono leading-relaxed">
                  {`🎯 Company Mission
We're on a mission to make healthcare accessible and affordable by building AI-powered patient engagement tools that help hospitals reduce readmission rates by 40%.

💎 Company Values
We value transparency, patient-first thinking, and innovation. Our team believes in data-driven decisions and continuous learning.

🏢 Company Overview
We're a 50-person team (30 MIT grads) in the Series B stage, building B2B SaaS for healthcare providers. We use React, Node.js, PostgreSQL, and AWS to power our platform.`}
                </p>
              </div>
              <div className="mt-2 text-xs text-green-700 dark:text-green-300 space-y-1">
                <div>✓ Clear mission with specific impact (40% reduction)</div>
                <div>✓ Specific values (not generic)</div>
                <div>✓ Team size, background, stage, business model</div>
                <div>✓ Real technologies (React, Node.js, etc.)</div>
              </div>
            </section>

            {/* Bad Example */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                ❌ Poor Example
              </h3>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-xs text-red-900 dark:text-red-100 font-mono leading-relaxed">
                  We&apos;re a tech company building innovative solutions. We&apos;re passionate about making a difference and value teamwork. We use cutting-edge technology.
                </p>
              </div>
              <div className="mt-2 text-xs text-red-700 dark:text-red-300 space-y-1">
                <div>✗ Too vague (&quot;innovative solutions&quot; - what exactly?)</div>
                <div>✗ Generic values (&quot;passionate&quot;, &quot;teamwork&quot;)</div>
                <div>✗ No specific technologies (&quot;cutting-edge&quot; is not a tech stack)</div>
                <div>✗ Missing: team size, stage, industry, business model</div>
              </div>
            </section>

            {/* Key Elements */}
            <section>
              <h3 className="text-sm font-semibold mb-3">🔑 Key Elements to Include</h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <div className="text-xs font-medium mb-1">Mission & Impact</div>
                  <p className="text-xs text-muted-foreground">
                    What problem do you solve? For whom? What&apos;s the measurable impact?
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Example: &quot;We help hospitals reduce readmission rates by 40%&quot;
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="text-xs font-medium mb-1">Company Values (2-4)</div>
                  <p className="text-xs text-muted-foreground">
                    Be specific. Not &quot;innovation&quot; but &quot;rapid experimentation and learning from failure&quot;
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Good: Transparency, Patient-first, Data-driven
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Bad: Passion, Excellence, Teamwork (too generic)
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="text-xs font-medium mb-1">Team & Stage</div>
                  <p className="text-xs text-muted-foreground">
                    Team size, stage (Seed, Series A, etc.), background if notable
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Example: &quot;50-person team, Series B, 30% former Google engineers&quot;
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="text-xs font-medium mb-1">Business Model</div>
                  <p className="text-xs text-muted-foreground">
                    B2B SaaS, B2C Marketplace, E-commerce, Enterprise, etc.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Example: &quot;B2B SaaS serving healthcare providers&quot;
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="text-xs font-medium mb-1">Technology Stack</div>
                  <p className="text-xs text-muted-foreground">
                    Programming languages, frameworks, databases, cloud platforms you use
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Good: React, Node.js, PostgreSQL, AWS, TypeScript
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Bad: &quot;Solar technology&quot;, &quot;AI solutions&quot; (too vague)
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Note: Only for tech companies. Restaurants, retail, etc. can skip or list tools like Square, Shopify.
                  </p>
                </div>

              </div>
            </section>

            {/* More Examples */}
            <section>
              <h3 className="text-sm font-semibold mb-3">💡 More Examples</h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <div className="text-xs font-medium mb-2">FinTech Startup</div>
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-line">
                    {`🎯 We're democratizing wealth management by making hedge fund strategies accessible to retail investors through AI-powered portfolio optimization.

💎 We value transparency, financial literacy, and inclusive finance.

🏢 Our 20-person team is building B2C SaaS in the Series A stage, using Python, React, PostgreSQL, and AWS.`}
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="text-xs font-medium mb-2">E-commerce Platform</div>
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-line">
                    {`🎯 We enable small businesses to compete with Amazon by providing enterprise-grade fulfillment infrastructure.

💎 We value merchant empowerment, operational excellence, and sustainability.

🏢 Our 100-person growth-stage company operates a B2B marketplace model, built with Node.js, React, MongoDB, and Google Cloud.`}
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="text-xs font-medium mb-2">Non-Tech: Restaurant Chain</div>
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-line">
                    {`🎯 We're reimagining fast-casual dining with farm-to-table ingredients and zero waste practices.

💎 We value sustainability, community impact, and culinary excellence.

🏢 Our 200-person team operates 15 locations across the Bay Area, using Square for POS and Toast for kitchen management.`}
                  </p>
                </div>
              </div>
            </section>

            {/* Tips */}
            <section>
              <h3 className="text-sm font-semibold mb-3">💡 Pro Tips</h3>
              <ul className="text-xs space-y-2 list-disc list-inside text-muted-foreground">
                <li>Be specific with numbers: &quot;50-person team&quot; not &quot;small team&quot;</li>
                <li>Use real tech names: &quot;React, Node.js&quot; not &quot;modern web technologies&quot;</li>
                <li>Make values distinctive: What makes YOUR culture unique?</li>
                <li>Include measurable impact: &quot;40% reduction&quot; not &quot;improved outcomes&quot;</li>
                <li>Keep it authentic: Don&apos;t exaggerate or make up facts</li>
                <li>2-4 sentences per section, ~200-500 total characters</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
