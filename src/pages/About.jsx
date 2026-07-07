import { Link } from "react-router-dom";
import {
  Target,
  Rocket,
  BookOpen,
  Users,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    text: "Every course is broken into clear lessons and modules, so you always know what's next.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    text: "See exactly how far you've come, what's completed, and what's left in every course.",
  },
  {
    icon: Users,
    title: "Expert Instructors",
    text: "Learn from instructors who bring real, practical, industry experience into every lesson.",
  },
  {
    icon: ShieldCheck,
    title: "Learn at Your Pace",
    text: "No pressure, no deadlines that don't make sense — pick up right where you left off.",
  },
];

const STATS = [
  { num: "10,000+", label: "Students Enrolled" },
  { num: "200+", label: "Expert Instructors" },
  { num: "15+", label: "Courses Available" },
  { num: "5+", label: "Years of Experience" },
];

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0284c7]">
          About Us
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
          Learning, built around{" "}
          <span className="text-[#0284c7]">you</span>
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto">
          Qnayds is a learning platform designed to make studying feel less like
          a scramble and more like a clear path — one lesson, one milestone, one
          skill at a time.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0284c7]/10">
              <Target className="h-5 w-5 text-[#0284c7]" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Our Mission</h3>
            <p className="mt-2 text-sm text-slate-500">
              To make quality learning accessible and easy to track — giving
              every student a clear view of their courses, progress, and next
              steps in one place.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0284c7]/10">
              <Rocket className="h-5 w-5 text-[#0284c7]" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Our Vision</h3>
            <p className="mt-2 text-sm text-slate-500">
              To become the platform learners return to, again and again —
              because it respects their time, tracks their growth, and never
              gets in the way of actually learning.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0284c7]">
              Why Qnayds
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              What makes it different
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl bg-white border border-slate-200 p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0284c7]/10">
                  <Icon className="h-5 w-5 text-[#0284c7]" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map(({ num, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-[#0284c7]">{num}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0284c7]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to start learning?
          </h2>
          <p className="mt-3 text-sm text-white/80">
            Browse our courses and find the one that fits where you want to go.
          </p>
          <Link
            to="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#0284c7] hover:bg-slate-100 transition-colors"
          >
            Explore Courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}