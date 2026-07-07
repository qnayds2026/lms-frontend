import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";

const coursesData = [
  {
    slug: "30-days-hacking",
    img: "hacking.png",
    title: "30 Days Hacking Course",
    desc: "Build a strong foundation in cybersecurity with our 30-Day Intensive Program.",
    duration: "30 Days",
    level: "Beginner",
  },
  {
    slug: "advanced-excel-ai",
    img: "Using Ai.png",
    title: "Advanced Excel Using AI",
    desc: "Master Excel like a professional using the power of AI in this 30-day intensive program.",
    duration: "30 Days",
    level: "Intermediate",
  },
  {
    slug: "advanced-cybersecurity",
    img: "cybersecurity.png",
    title: "Advanced Cybersecurity Course",
    desc: "A job-oriented professional program covering advanced, real-world security skills.",
    duration: "45 Days",
    level: "Advanced",
  },
  {
    slug: "ai-poster-designing",
    img: "ai poster.png",
    title: "Advanced AI Poster Designing",
    desc: "Master the art of professional poster creation using cutting-edge AI tools.",
    duration: "15 Days",
    level: "Beginner",
  },
  {
    slug: "ai-for-teachers",
    img: "ai for teachers.png",
    title: "AI for Teachers",
    desc: "Empower your classroom with artificial intelligence and modern teaching tools.",
    duration: "10 Days",
    level: "Beginner",
  },
  {
    slug: "robotics and iot",
    img: "robotics.png",
    title: "Robotics and IoT",
    desc: "Learn the basics of robotics — sensors, actuators, and control systems — through hands-on builds Design and build connected devices, from microcontrollers to cloud dashboards.",
    duration: "30 Days",
    level: "Beginner",
  },
 
];

function CourseCard({ course }) {
  return (
    <div className="group rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#0284c7]/30 transition-all">
      {/* Thumbnail */}
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={course.img}
          alt={course.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-[#0284c7] bg-[#0284c7]/10 px-2 py-0.5 rounded-full">
            {course.level}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {course.duration}
          </span>
        </div>

        <h3 className="text-base font-semibold text-slate-900 leading-snug">
          {course.title}
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
          {course.desc}
        </p>

        <Link
          to={`/courses/${course.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0284c7] hover:gap-2.5 transition-all"
        >
          View Course
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function Courses() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0284c7]">
            Our Courses
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
            Find your next skill
          </h1>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            Practical, job-ready courses designed to take you from beginner to
            confident practitioner.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}