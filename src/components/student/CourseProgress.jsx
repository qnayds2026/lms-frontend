import { Trophy, Check, Lock, Flame, Play } from "lucide-react";

const CourseProgress = ({ progress, modules = [] }) => {
  if (!progress) return null;

  const {
    totalLessons = 0,
    completedLessons = 0,
    progressPercentage = 0,
    isCompleted = false,
  } = progress;

  const percentage = Math.min(100, Math.max(0, progressPercentage));

  let remainingCompleted = Math.max(0, Number(completedLessons) || 0);

  const moduleProgress = modules.map((module, index) => {
    const recordings = module.recordings || [];
    const total = recordings.length;

    const completed = Math.min(remainingCompleted, total);

    remainingCompleted -= completed;

    const modulePercentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...module,
      level: index + 1,
      total,
      completed,
      percentage: modulePercentage,
      isCompleted: total > 0 && completed === total,
    };
  });

  const currentModule =
    moduleProgress.find((module) => !module.isCompleted) ||
    moduleProgress[moduleProgress.length - 1];

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50">
              <Trophy className="h-5 w-5 text-sky-600" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                Your learning journey
              </p>

              <h2 className="text-lg font-bold text-slate-900">
                {isCompleted
                  ? "Course Completed!"
                  : currentModule
                    ? `Level ${currentModule.level} — ${currentModule.title}`
                    : "Keep Learning"}
              </h2>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-2xl font-bold text-slate-900">
              {percentage}%
            </div>

            <p className="text-xs text-slate-500">
              {completedLessons} of {totalLessons} lessons
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Course progress</span>

            <span className="font-semibold text-sky-600">
              {totalLessons - completedLessons > 0
                ? `${totalLessons - completedLessons} lessons remaining`
                : "All lessons completed"}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-sky-500 to-cyan-400 transition-all duration-700 ease-out"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Flame className="h-4 w-4 text-orange-500" />

          {isCompleted
            ? "Amazing! You completed the entire course."
            : percentage >= 75
              ? "You're almost there! Keep going."
              : percentage >= 40
                ? "Great progress! Keep building your skills."
                : "Start your journey and level up your skills."}
        </div>
      </div>

      {moduleProgress.length > 0 && (
        <div className="overflow-x-auto px-5 py-5 sm:px-6">
          <div className="flex min-w-max items-start">
            {moduleProgress.map((module, index) => {
              const isCurrent = currentModule?.id === module.id;

              const isLocked =
                index > 0 && !moduleProgress[index - 1]?.isCompleted;

              return (
                <div key={module.id} className="flex items-start">
                  <div className="flex w-28 flex-col items-center text-center sm:w-36">
                    <div
                      className={[
                        "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                        module.isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isCurrent
                            ? "border-sky-500 bg-sky-50 text-sky-600 shadow-sm ring-4 ring-sky-50"
                            : "border-slate-200 bg-slate-50 text-slate-400",
                      ].join(" ")}
                    >
                      {module.isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </div>

                    <p
                      className={[
                        "mt-2 text-[10px] font-bold uppercase tracking-wider",
                        module.isCompleted
                          ? "text-emerald-600"
                          : isCurrent
                            ? "text-sky-600"
                            : "text-slate-400",
                      ].join(" ")}
                    >
                      Level {module.level}
                    </p>

                    <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-700">
                      {module.title}
                    </p>

                    <p
                      className={[
                        "mt-1 text-[10px] font-medium",
                        module.isCompleted
                          ? "text-emerald-600"
                          : isCurrent
                            ? "text-sky-600"
                            : "text-slate-400",
                      ].join(" ")}
                    >
                      {module.completed}/{module.total} lessons
                    </p>

                    <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={[
                          "h-full rounded-full transition-all duration-500",
                          module.isCompleted
                            ? "bg-emerald-500"
                            : isCurrent
                              ? "bg-sky-500"
                              : "bg-slate-300",
                        ].join(" ")}
                        style={{
                          width: `${module.percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  {index < moduleProgress.length - 1 && (
                    <div className="mt-5 h-0.5 w-10 bg-slate-200 sm:w-16">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: module.isCompleted ? "100%" : "0%",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="border-t border-emerald-100 bg-emerald-50 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Trophy className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold text-emerald-800">
                  Course completed 🎉
                </p>

                <p className="text-xs text-emerald-700">
                  Your certificate is ready to unlock.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              View Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;
