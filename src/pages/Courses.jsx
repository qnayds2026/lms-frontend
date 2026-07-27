import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../api/axios";
import { motion } from "framer-motion";

function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#0284c7]/30 transition-all block"
    >
      {/* Thumbnail */}
      <div className="aspect-16/10 w-full overflow-hidden bg-slate-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-slate-100" />
        )}
      </div>

      <div className="p-5">
        {course.instructor?.name && (
          <p className="text-xs font-semibold text-[#0284c7] mb-2">
            {course.instructor.name}
          </p>
        )}

        <h3 className="text-base font-semibold text-slate-900 leading-snug">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
            {course.description}
          </p>
        )}

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0284c7] group-hover:gap-2.5 transition-all">
          View Course
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/courses")
      .then((res) => {
        if (!cancelled) setCourses(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load courses");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

   {/* Loading */}
{loading && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, index) => (
      <div
        key={index}
        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-pulse"
      >
        <div className="h-48 bg-slate-200" />

        <div className="p-5 space-y-4">
          <div className="h-5 w-3/4 rounded bg-slate-200" />

          <div className="space-y-2">
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
          </div>

          <div className="flex justify-between pt-3">
            <div className="h-8 w-24 rounded bg-slate-200" />
            <div className="h-8 w-20 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    ))}
  </div>
)}

{/* Error */}
{!loading && error && (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20"
  >
    <div className="text-6xl mb-4">⚠️</div>

    <h3 className="text-2xl font-bold text-slate-800">
      Something went wrong
    </h3>

    <p className="mt-3 text-slate-500 text-center max-w-md">
      {error}
    </p>

    <button
      onClick={() => window.location.reload()}
      className="mt-6 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700"
    >
      Try Again
    </button>
  </motion.div>
)}

{/* Empty */}
{!loading && !error && courses.length === 0 && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-24"
  >
    <div className="text-7xl">📚</div>

    <h3 className="mt-6 text-2xl font-bold text-slate-800">
      No Courses Yet
    </h3>

    <p className="mt-2 max-w-md text-center text-slate-500">
      New courses are being prepared. Check back soon to explore exciting
      learning opportunities.
    </p>
  </motion.div>
)}

{/* Courses */}
{!loading && !error && courses.length > 0 && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {courses.map((course, index) => (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.5,
          delay: index * 0.08,
        }}
      >
        <CourseCard course={course} />
      </motion.div>
    ))}
  </div>
)}
      </div>
    </div>
  );
}