import React, { useState, useEffect } from "react";
import {
  Shield,
  Code2,
  BrainCircuit,
  Briefcase,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Users,
  BookOpen,
  Video,
  FlaskConical,
  Award,
  Quote,
} from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const SCAN_LINES = [
  { label: "Students_Trained ", value: "10,000+" },
  { label: "Engineering_Colleges", value: "100+" },
  { label: "Expert_Trainers", value: "200+" },
];

function ScanConsole() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visibleCount < SCAN_LINES.length) {
      const t = setTimeout(() => setVisibleCount((c) => c + 1), 450);
      return () => clearTimeout(t);
    } else if (!done) {
      const t = setTimeout(() => setDone(true), 300);
      return () => clearTimeout(t);
    }
  }, [visibleCount, done]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden w-full max-w-md">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-slate-400" style={mono}>
          qnayds — status
        </span>
      </div>
      <div className="p-5 text-sm space-y-2.5 min-h-55" style={mono}>
        <p className="text-slate-400">$ qnayds --status</p>
        {SCAN_LINES.map((line, i) => (
          <p
            key={line.label}
            className={`flex items-center justify-between transition-opacity duration-500 ${
              i < visibleCount ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              {line.label}
            </span>
            <span className="text-slate-900 font-medium">{line.value}</span>
          </p>
        ))}
        <p
          className={`pt-2 text-sky-700 transition-opacity duration-500 ${
            done ? "opacity-100" : "opacity-0"
          }`}
        >
          {"> access: granted"}
          <span className="inline-block w-2 h-4 bg-sky-600 ml-1 align-middle animate-pulse" />
        </p>
      </div>
    </div>
  );
}
const TRACKS = [
  {
    icon: Shield,
    title: "Cyber Security",
    desc: "Learn ethical hacking, penetration testing, network security, and cyber defense through practical labs.",
  },
  {
    icon: BrainCircuit,
    title: "Artificial Intelligence",
    desc: "Explore AI, machine learning, prompt engineering, and intelligent automation solutions.",
  },

  {
    icon: BrainCircuit,
    title: "Advanced AI & Creative Design",
    desc: "Learn AI tools, poster designing, branding, content creation, and modern design.",
  },
  {
    icon: Briefcase,
    title: "Career Development",
    desc: "Gain interview preparation, resume building, communication skills, and placement support.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: Video,
    title: "Enroll & attend live classes",
    desc: "Join scheduled sessions with instructors, or catch every recording on your own time.",
  },
  {
    n: "02",
    icon: FlaskConical,
    title: "Practice in hands-on labs",
    desc: "Apply what you learned in sandboxed environments built for the topic, not slides.",
  },
  {
    n: "03",
    icon: Users,
    title: "Get mentored",
    desc: "Weekly check-ins with mentors who review your work and unblock you.",
  },
  {
    n: "04",
    icon: Award,
    title: "Certify & get placed",
    desc: "Finish with a portfolio, a certificate, and interview support.",
  },
];

const MENTORS = [
  { initials: "RN", name: "Rishan N K", role: "IoT & Robotics Trainer" },
  { initials: "SK", name: "Sawad K T", role: "Digital Marketing & AI Trainer" },
  {
    initials: "AB",
    name: "Abhilash O S",
    role: "Microelectronics & VLSI Traine",
  },
  { initials: "SK", name: "Sayanth K S", role: "Robotics Trainer" },
];

const TESTIMONIALS = [
  {
    quote:
      "The labs are the whole point — I broke things in a sandbox first, so I stopped breaking them at work.",
    name: "Rohit S.",
    role: "Cybersecurity track",
  },
  {
    quote:
      "Recordings meant I never fell behind, even with a full-time job. Mentors kept me accountable.",
    name: "Meera J.",
    role: "Full Stack track",
  },
  {
    quote:
      "I went from zero ML background to shipping a working model in twelve weeks.",
    name: "Fahad K.",
    role: "AI track",
  },
];

const Home = () => {
  return (
    <div
      className="bg-white text-slate-900"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONT_IMPORT}</style>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,132,199,0.08),transparent_55%)]" />
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-14 relative">
          <div className="max-w-xl">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium"
              style={mono}
            >
              <Terminal className="w-3.5 h-3.5" /> QNAYDS
            </span>
            <h1
              className="mt-6 text-5xl lg:text-6xl font-semibold leading-[1.05] text-slate-900"
              style={display}
            >
              Learn.
              <span className="text-sky-600"> Build.</span>
              <br />
              Grow.
            </h1>
            <p className="mt-6 text-slate-500 text-lg leading-relaxed">
              Empowering students, professionals, and institutions with
              future-ready education, hands-on training, industry
              certifications, and career acceleration programs.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <button className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-7 py-3 rounded-lg transition inline-flex items-center gap-2">
                Explore courses <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border border-slate-300 text-slate-700 px-7 py-3 rounded-lg hover:border-sky-400 hover:text-sky-700 transition">
                Join now
              </button>
            </div>
          </div>
          <div className="lg:ml-auto">
            <ScanConsole />
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="max-w-xl mb-12">
          <p className="text-sky-600 text-sm font-medium" style={mono}>
            what you'll learn
          </p>
          <h2
            className="mt-3 text-3xl lg:text-4xl font-semibold"
            style={display}
          >
            Four tracks, one platform
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRACKS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 transition group"
            >
              <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center group-hover:bg-sky-600 transition">
                <Icon className="w-5 h-5 text-sky-600 group-hover:text-white transition" />
              </div>
              <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-xl mb-12">
            <p className="text-sky-600 text-sm font-medium" style={mono}>
              the path
            </p>
            <h2
              className="mt-3 text-3xl lg:text-4xl font-semibold"
              style={display}
            >
              How you'll get there
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="relative">
                <span
                  className="text-5xl font-semibold text-slate-200 select-none"
                  style={display}
                >
                  {n}
                </span>
                <div className="mt-2 flex items-center gap-2 text-sky-600">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="mt-2 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-xl mb-12">
          <p className="text-sky-600 text-sm font-medium" style={mono}>
            who's teaching
          </p>
          <h2
            className="mt-3 text-3xl lg:text-4xl font-semibold"
            style={display}
          >
            Mentors from the field
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MENTORS.map(({ initials, name, role }) => (
            <div
              key={name}
              className="p-6 rounded-2xl border border-slate-200 text-center hover:border-sky-300 transition"
            >
              <div
                className="w-14 h-14 mx-auto rounded-full bg-sky-600 flex items-center justify-center text-white font-medium"
                style={display}
              >
                {initials}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{name}</h3>
              <p className="mt-1 text-sm text-slate-500">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-xl mb-12">
            <p className="text-sky-400 text-sm font-medium" style={mono}>
              from students
            </p>
            <h2
              className="mt-3 text-3xl lg:text-4xl font-semibold"
              style={display}
            >
              Proof over promises
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role }) => (
              <div
                key={name}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700"
              >
                <Quote className="w-5 h-5 text-sky-400" />
                <p className="mt-4 text-slate-200 leading-relaxed text-sm">
                  {quote}
                </p>
                <p className="mt-5 text-sm font-medium">{name}</p>
                <p className="text-xs text-slate-400">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <BookOpen className="w-8 h-8 text-sky-600 mx-auto" />
        <h2 className="mt-5 text-3xl lg:text-4xl font-semibold" style={display}>
          Your next skill starts with one class
        </h2>
        <p className="mt-4 text-slate-500 max-w-md mx-auto">
          Pick a track, join a live session this week, and see if it's a fit —
          no long-term commitment required.
        </p>
        <button className="mt-8 bg-sky-600 hover:bg-sky-700 text-white font-medium px-8 py-3.5 rounded-lg transition inline-flex items-center gap-2">
          Explore courses <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};

export default Home;
