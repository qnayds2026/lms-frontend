import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../api/axios";

function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#0284c7]/30 transition-all block"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
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

        {loading && (
          <p className="text-center text-slate-400">Loading courses...</p>
        )}

        {!loading && error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {!loading && !error && courses.length === 0 && (
          <p className="text-center text-slate-400">No courses available yet.</p>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}