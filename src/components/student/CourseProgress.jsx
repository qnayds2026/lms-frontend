import { Trophy, Check, Lock, Flame, Play, Share2, Award } from "lucide-react";

const CourseProgress = ({
  progress,
  modules = [],
  onSelectLevel,
  onShareLevel,
  activeModuleId,
}) => {
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
    (activeModuleId &&
      moduleProgress.find((module) => module.id === activeModuleId)) ||
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

              const handleLevelClick = () => {
                if (isLocked) {
                  alert(
                    `Level ${module.level} is locked. Complete Level ${module.level - 1} first to unlock this level.`
                  );
                } else if (onSelectLevel) {
                  onSelectLevel(module);
                }
              };

              return (
                <div key={module.id} className="flex items-start">
                  <button
                    type="button"
                    onClick={handleLevelClick}
                    title={
                      isLocked
                        ? `Level ${module.level} is locked. Complete previous level to unlock.`
                        : `Click to go to Level ${module.level}: ${module.title}`
                    }
                    className={[
                      "flex w-28 flex-col items-center text-center sm:w-36 transition-all p-1.5 rounded-2xl focus:outline-none",
                      isLocked
                        ? "cursor-not-allowed opacity-60 hover:opacity-80"
                        : "cursor-pointer hover:bg-sky-50/70 hover:scale-[1.03] group",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                        module.isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                          : isCurrent
                            ? "border-sky-500 bg-sky-50 text-sky-600 shadow-sm ring-4 ring-sky-100"
                            : isLocked
                              ? "border-slate-200 bg-slate-100 text-slate-400"
                              : "border-sky-300 bg-white text-sky-600 group-hover:border-sky-500 group-hover:bg-sky-50",
                      ].join(" ")}
                    >
                      {module.isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-center gap-1">
                      <p
                        className={[
                          "text-[10px] font-bold uppercase tracking-wider",
                          module.isCompleted
                            ? "text-emerald-600"
                            : isCurrent
                              ? "text-sky-600"
                              : isLocked
                                ? "text-slate-400"
                                : "text-slate-600 group-hover:text-sky-600",
                        ].join(" ")}
                      >
                        Level {module.level}
                      </p>
                      {isLocked && (
                        <Lock className="h-2.5 w-2.5 text-slate-400" />
                      )}
                    </div>

                    <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">
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

                    {module.isCompleted && onShareLevel ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareLevel(module);
                        }}
                        className="mt-1.5 flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 px-2 py-0.5 rounded-full border border-emerald-200 transition-colors cursor-pointer shadow-xs"
                        title={`Share Level ${module.level} Badge`}
                      >
                        <Share2 className="h-2.5 w-2.5" />
                        <span>Share Badge</span>
                      </span>
                    ) : (
                      !isLocked && (
                        <span className="mt-1.5 text-[9px] font-medium text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity bg-sky-100 px-1.5 py-0.5 rounded">
                          Click to play
                        </span>
                      )
                    )}
                  </button>

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

            <div className="flex items-center gap-2">
              {onShareLevel && (
                <button
                  type="button"
                  onClick={() =>
                    onShareLevel({
                      level: moduleProgress.length,
                      title: "Full Course Mastery",
                      isCourseCompleted: true,
                    })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3.5 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100/60 shadow-xs cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Achievement</span>
                </button>
              )}

              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 cursor-pointer"
              >
                View Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;
