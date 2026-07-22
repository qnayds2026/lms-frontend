import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get(`/courses/${id}`)
      .then((res) => {
        if (!cancelled) setCourse(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? "Course not found"
              : err.message || "Failed to load course"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Link to="/courses" className="text-[#0284c7] font-medium">
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0284c7] mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>

        {course.thumbnail && (
          <div className="aspect-[16/7] w-full overflow-hidden rounded-xl bg-slate-100 mb-8">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {course.instructor?.name && (
          <p className="text-sm font-semibold text-[#0284c7] mb-2">
            {course.instructor.name}
          </p>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          {course.title}
        </h1>

        {course.description && (
          <p className="mt-4 text-slate-600 leading-relaxed">
            {course.description}
          </p>
        )}

        {typeof course.price === "number" && (
          <p className="mt-6 text-2xl font-bold text-slate-900">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </p>
        )}

        {course.modules?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Course Content
            </h2>
            <div className="space-y-2">
              {course.modules.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-lg border border-slate-200 px-4 py-3"
                >
                  <p className="font-medium text-slate-800">{mod.title}</p>
                  {mod.recordings?.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {mod.recordings.length} lesson
                      {mod.recordings.length === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          to="/register"
          className="mt-10 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#0284c7] rounded-md hover:bg-[#0369a1] transition-colors"
        >
          Enroll Now
        </Link>
      </div>
    </div>
  );
}