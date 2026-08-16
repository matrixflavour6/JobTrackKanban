import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, GitBranch, Scale, Target, Cloud, ArrowRight } from 'lucide-react';
import { AppFooter } from './AppFooter';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const features = [
  {
    icon: Shield,
    eyebrow: 'Private by design',
    title: 'Your job search.\nYour browser. Only.',
    body: 'No account required to start. No server holds your data. Everything lives in this browser until you explicitly choose to back it up.',
  },
  {
    icon: GitBranch,
    eyebrow: 'See the real picture',
    title: 'Where every\napplication actually goes.',
    body: 'A genuine flow diagram built from your own data — not a generic funnel graphic. See exactly where applications stall.',
  },
  {
    icon: Scale,
    eyebrow: 'Decide with confidence',
    title: 'Compare offers.\nNot just numbers.',
    body: 'Weight compensation, commute, culture, and growth the way that matters to you — then let the math help you decide.',
  },
  {
    icon: Target,
    eyebrow: "Beat the filter",
    title: "Know what's missing\nbefore you hit submit.",
    body: 'A client-side ATS keyword match against any job description — entirely in your browser, nothing uploaded.',
  },
  {
    icon: Cloud,
    eyebrow: 'Optional, not required',
    title: 'Sync when you\nwant to. Skip it if not.',
    body: 'Connect Google to back up to your own Drive and scan Gmail for application confirmations — or never connect anything at all.',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-paper text-ink">
      {/* Hero */}
      <section className="min-h-[92vh] flex flex-col items-center justify-center text-center px-5 pt-20 pb-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-sm font-semibold text-ledger mb-4 tracking-wide"
        >
          JobTrack Pro
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-ink leading-[1.05] tracking-tight text-[clamp(2.5rem,8vw,5.5rem)] max-w-4xl"
        >
          Track your search.
          <br />
          <span className="text-ledger">Keep it private.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-lg sm:text-xl text-ink-soft max-w-xl"
        >
          A Kanban board for job applications that never asks for an account —
          and stays honest about what it can and can't do for you.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 flex flex-col sm:flex-row items-center gap-3"
        >
          <button
            onClick={() => navigate('/board')}
            className="px-7 py-3 rounded-full bg-ledger text-white font-semibold text-base glow-ledger hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            Open the App
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="https://matrixflavour.gumroad.com/l/job-tracker-kanban"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3 rounded-full bg-paper-dim text-ink font-semibold text-base hover:bg-ink/5 transition-all cursor-pointer border border-ink/10"
          >
            Get Lifetime License — $8
          </a>
        </motion.div>
      </section>

      {/* Feature sections — scroll reveal */}
      {features.map((f, i) => (
        <motion.section
          key={f.title}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className={`px-5 py-24 sm:py-32 flex flex-col items-center text-center ${
            i % 2 === 1 ? 'bg-paper-dim' : 'bg-paper'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-ledger-soft flex items-center justify-center mb-6">
            <f.icon className="w-7 h-7 text-ledger" />
          </div>
          <p className="text-sm font-semibold text-ledger mb-3">{f.eyebrow}</p>
          <h2 className="font-display font-bold text-ink leading-[1.1] tracking-tight text-[clamp(2rem,5vw,3.5rem)] max-w-2xl whitespace-pre-line">
            {f.title}
          </h2>
          <p className="mt-5 text-base sm:text-lg text-ink-soft max-w-lg">
            {f.body}
          </p>
        </motion.section>
      ))}

      {/* Closing CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeUp}
        className="px-5 py-28 flex flex-col items-center text-center"
      >
        <h2 className="font-display font-bold text-ink leading-[1.05] tracking-tight text-[clamp(2rem,6vw,4rem)] max-w-2xl">
          Start where you are.
        </h2>
        <p className="mt-4 text-lg text-ink-soft max-w-md">
          No sign-up. No credit card. Your board is ready the moment you open it.
        </p>
        <button
          onClick={() => navigate('/board')}
          className="mt-8 px-8 py-3.5 rounded-full bg-ledger text-white font-semibold text-base glow-ledger hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          Open the App
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.section>

      <AppFooter />
    </div>
  );
};
