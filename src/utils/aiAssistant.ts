import { AICoverLetterOutput, AIInterviewQuestion, JobApplication } from '../types';
import { getAISettings } from './storage';

/**
 * Intelligent AI Assistant with support for:
 * 1. Direct BYOK Gemini API (if user inputs their free Gemini API Key in settings)
 * 2. High-accuracy zero-latency algorithmic fallback (works 100% offline without any API key)
 */

export async function generateCoverLetter(
  job: Partial<JobApplication>,
  userResumeSummary: string = ''
): Promise<AICoverLetterOutput> {
  const settings = getAISettings();

  if (settings.enabled && settings.apiKey) {
    try {
      const prompt = `Write a high-impact, professional 3-paragraph cover letter for the role of "${job.position || 'Software Professional'}" at "${job.company || 'the target company'}".
Candidate skills/resume notes: ${userResumeSummary || 'Senior engineer with proven experience in scalable web applications, full-stack systems, and collaboration.'}
Job location: ${job.location || 'Remote'}
Job notes/requirements: ${job.notes || 'Full cycle development and product impact.'}

Return ONLY valid JSON with keys: "subject", "opening", "body", "closing", "fullText"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text);
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local generator', e);
    }
  }

  // High quality local template generator
  const comp = job.company || 'your team';
  const role = job.position || 'this position';
  const subject = `Application for ${role} — ${job.company || 'Opportunity'}`;
  const opening = `Dear Hiring Team at ${comp},\n\nI am writing to express my enthusiasm for the ${role} position. With my background in high-performance application engineering and a track record of delivering user-centric software solutions, I am excited about the opportunity to contribute directly to ${comp}'s mission.`;
  const body = `Throughout my career, I have focused on writing clean, scalable code and collaborating cross-functionally to transform product requirements into resilient architectures. ${userResumeSummary ? `Specifically: ${userResumeSummary.slice(0, 200)}.` : `I bring deep hands-on expertise with modern engineering methodologies, clean component architecture, and continuous iteration.`} I am particularly drawn to ${comp}'s focus on innovation and would welcome the chance to bring my problem-solving abilities to your team.`;
  const closing = `Thank you for your time and consideration. I would welcome the opportunity to discuss how my skill set and enthusiasm align with your goals for the ${role}. I look forward to speaking with you soon.\n\nSincerely,\nCandidate`;

  return {
    subject,
    opening,
    body,
    closing,
    fullText: `${subject}\n\n${opening}\n\n${body}\n\n${closing}`,
  };
}

export async function generateInterviewPrep(
  job: Partial<JobApplication>
): Promise<AIInterviewQuestion[]> {
  const settings = getAISettings();
  const comp = job.company || 'the target company';
  const role = job.position || 'Software Engineer';

  if (settings.enabled && settings.apiKey) {
    try {
      const prompt = `Generate 5 targeted interview questions (mix of technical, behavioral, and situational) for a candidate interviewing for "${role}" at "${comp}".
Job details: ${job.notes || 'Full stack engineering, cross-functional collaboration'}
Tags: ${(job.tags || []).join(', ')}

Return ONLY a valid JSON array of objects with keys: "question", "category" (enum: "technical"|"behavioral"|"situational"), "tips", "suggestedFramework"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text);
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local generator', e);
    }
  }

  // Local structured interview prep bank
  return [
    {
      question: `How would you architect a core component or service at ${comp} for high reliability and low latency?`,
      category: 'technical',
      tips: `Highlight scalability bottlenecks, caching strategies, state sync, and trade-offs between speed and consistency.`,
      suggestedFramework: `Requirements -> High-Level Design -> Deep Dive -> Edge Cases & Trade-offs`,
    },
    {
      question: `Tell me about a time you had a technical disagreement with a teammate or product manager. How did you resolve it?`,
      category: 'behavioral',
      tips: `Emphasize empathy, data-driven reasoning, testing hypotheses with prototypes, and alignment on shared user goals.`,
      suggestedFramework: `STAR (Situation, Task, Action, Result)`,
    },
    {
      question: `Why are you interested in joining ${comp} specifically over other companies?`,
      category: 'behavioral',
      tips: `Connect your personal passions with ${comp}'s public engineering challenges, product philosophy, or culture.`,
      suggestedFramework: `Past Accomplishments -> Current Passion -> Future Impact at ${comp}`,
    },
    {
      question: `If you were tasked with migrating a legacy module with zero downtime, what roadmap would you execute?`,
      category: 'situational',
      tips: `Discuss feature flags, shadow traffic / dark launching, canary deployments, and automated rollback triggers.`,
      suggestedFramework: `Audit -> Parallel Run -> Canary Deploy -> Deprecation`,
    },
    {
      question: `Describe a complex bug you diagnosed in production. What was the root cause and how did you prevent recurrence?`,
      category: 'technical',
      tips: `Walk through observability tools, logs, root cause analysis, and testing improvements to prevent regressions.`,
      suggestedFramework: `Detection -> Isolation -> Root Cause -> Fix -> Long-term Prevention`,
    },
  ];
}

export function generateNegotiationStrategy(
  job: Partial<JobApplication>,
  targetSalaryNumber?: number
): { summary: string; script: string; tips: string[] } {
  const comp = job.company || 'the company';
  const role = job.position || 'this role';
  const salaryText = job.salary || '$150,000';

  const script = `Hi [Recruiter Name],\n\nThank you again for extending this offer for the ${role} position at ${comp}. I am genuinely excited about the team's roadmap and the impact we can make.\n\nBased on my specialized background in [Key Skill], current market compensation benchmarks for ${role}s in this tier, and competing opportunities, I would be thrilled to sign immediately if we could adjust the base compensation to ${targetSalaryNumber ? `$${targetSalaryNumber.toLocaleString()}` : 'a higher band'} or explore a performance signing bonus.\n\nI want to make this partnership work seamlessly and look forward to hearing your thoughts.\n\nBest regards,\n[Your Name]`;

  return {
    summary: `Structured strategy for negotiating offers with ${comp} based on market value, equity upside, and signing incentives.`,
    script,
    tips: [
      `Always express authentic excitement about the role before discussing numbers.`,
      `Anchor with a specific, well-researched number rather than an ambiguous "more".`,
      `Offer instant commitment if your target is met ("I will sign today if...").`,
      `If base salary is rigid, negotiate for signing bonuses, equity refreshers, or accelerated review cycles.`,
    ],
  };
}
