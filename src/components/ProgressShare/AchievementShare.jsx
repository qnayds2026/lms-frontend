import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { toPng } from "html-to-image";
import {
  Trophy,
  Award,
  CheckCircle2,
  Share2,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Terminal,
} from "lucide-react";

// =====================================================
// FONTS & DESIGN TOKENS (MATCHING QNAYDS LMS)
// =====================================================
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');`;

const displayFont = { fontFamily: "'Space Grotesk', sans-serif" };
const monoFont = { fontFamily: "'JetBrains Mono', monospace" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

/**
 * Official WhatsApp OG Logo (Green circle with white phone speech receiver)
 */
const WhatsAppOGIcon = ({ className = "h-4 w-4 shrink-0" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#25D366"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.66 1.438 5.176L2 22l4.982-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
    />
    <path
      fill="#FFFFFF"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.507 14.385c-.286-.143-1.69-.834-1.952-.929-.262-.095-.452-.143-.643.143-.19.286-.738.929-.905 1.119-.167.19-.333.214-.619.071-.286-.143-1.208-.445-2.3-1.42-.85-.758-1.423-1.695-1.59-1.98-.167-.286-.018-.44.125-.582.129-.128.286-.333.429-.5.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.5-.071-.143-.643-1.548-.881-2.119-.232-.557-.468-.481-.643-.49-.166-.009-.357-.01-.548-.01-.19 0-.5.071-.762.357-.262.286-1 0.976-1 2.381 0 1.405 1.024 2.762 1.167 2.952.143.19 2.014 3.076 4.881 4.314.682.295 1.214.471 1.629.603.685.218 1.309.187 1.802.113.55-.083 1.69-.69 1.928-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.548-.333z"
    />
  </svg>
);

/**
 * Format milestone date in standard LMS format
 */
const formatMilestoneDate = (dateVal) => {
  try {
    const d = dateVal ? new Date(dateVal) : new Date();
    if (isNaN(d.getTime())) {
      return new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
};

/**
 * QNAYDS LMS ACHIEVEMENT & LEVEL SHARE COMPONENT (LIGHT THEME)
 * Designed cleanly in Light Mode matching QNAYDS LMS aesthetic,
 * using the official WhatsApp OG logo and reliable multi-channel sharing.
 */
export default function AchievementShare({
  isOpen = true,
  onClose,
  course,
  module,
  levelData,
  progress,
  user: propUser,
  certificate,
  data: customData,
}) {
  const cardRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Extract current active user
  const activeUser = useMemo(() => {
    if (propUser && (propUser.name || propUser.fullName)) return propUser;
    try {
      const stored = localStorage.getItem("user");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  }, [propUser]);

  // Normalize achievement metadata
  const achievementData = useMemo(() => {
    const targetModule = levelData || module || {};
    const courseObj = course || {};
    const progObj = progress || {};

    const studentName =
      customData?.studentName ||
      activeUser?.name ||
      activeUser?.fullName ||
      "Qnayds Scholar";

    const courseName =
      customData?.courseName ||
      courseObj.title ||
      progObj.courseTitle ||
      "Technical Career Certification";

    const courseId = customData?.courseId || courseObj.id || progObj.courseId || "";

    const level = customData?.level ?? targetModule.level ?? 1;

    const levelTitle =
      customData?.levelTitle ||
      targetModule.title ||
      (level ? `Level ${level} Mastery` : "Milestone Achievement");

    const totalLessons =
      customData?.totalLessons ??
      targetModule.total ??
      (targetModule.recordings ? targetModule.recordings.length : 0);

    const completedLessons =
      customData?.completedLessons ??
      targetModule.completed ??
      totalLessons;

    const isCourseCompleted =
      customData?.isCourseCompleted ??
      targetModule.isCourseCompleted ??
      progObj.isCompleted ??
      (progObj.totalLessons > 0 && progObj.completedLessons >= progObj.totalLessons);

    const completedAt =
      customData?.completedAt ||
      formatMilestoneDate(targetModule.completedAt || progObj.completedAt || new Date());

    const certificateNumber =
      certificate?.certificateNumber ||
      customData?.credentialId;

    const credentialId =
      certificateNumber ||
      `QNY-L${level}-${Math.abs(
        (Number(courseId) || 101) * 31 + Number(level) * 17 + (activeUser?.id || 1) * 7
      )
        .toString()
        .padStart(4, "0")
        .slice(-4)}`;

    return {
      studentName,
      courseName,
      courseId,
      level,
      levelTitle,
      totalLessons,
      completedLessons,
      isCourseCompleted,
      completedAt,
      credentialId,
      achievementUrl: "https://lms.qnayds.in/",
      contactNumber: "+91 9074871204",
      whatsappContactUrl: "https://wa.me/919074871204",
      platformName: "QNAYDS",
    };
  }, [customData, course, module, levelData, progress, activeUser, certificate]);

  // Toast feedback
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  // LMS Celebratory Confetti Animation
  useEffect(() => {
    if (!isOpen) return;

    const canvas = document.getElementById("qnayds-confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // QNAYDS LMS palette: Sky, Cyan, Emerald, Amber/Gold, White
    const colors = [
      "#0284c7",
      "#38bdf8",
      "#059669",
      "#10b981",
      "#f59e0b",
      "#fbbf24",
      "#6366f1",
      "#ffffff",
    ];

    const particles = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 60,
        y: height / 2 - 40,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 1.4) * 15,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    let frame = 0;
    let animId = null;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      let active = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.vx *= 0.98; // drag
        p.rotation += p.rSpeed;
        if (frame > 25) p.opacity -= 0.015;

        if (p.opacity > 0) {
          active = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.75);
          ctx.restore();
        }
      });

      frame++;
      if (active && frame < 140) {
        animId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (canvas && ctx) ctx.clearRect(0, 0, width, height);
    };
  }, [isOpen]);

  // High-resolution image capture of the badge card in pure clean white
  const generateCardImage = async () => {
    if (!cardRef.current) return null;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2.8,
        cacheBust: true,
        quality: 0.98,
        backgroundColor: "#ffffff",
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const sanitizedName = achievementData.studentName
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();
      const filename = `${sanitizedName}-qnayds-level-${achievementData.level}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      return { dataUrl, blob, file, filename };
    } catch (err) {
      console.error("Error generating achievement card:", err);
      showToast("❌ Could not generate achievement badge image.");
      return null;
    }
  };

  // High-converting promotional text promoting Qnayds LMS
  const getPromoText = () => {
    const isFull = achievementData.isCourseCompleted;
    return (
      `🎓 ${isFull ? "Course Completed!" : "Milestone Achieved!"} on QNAYDS LMS 🚀\n\n` +
      `👤 Student: ${achievementData.studentName}\n` +
      `📚 Course: ${achievementData.courseName}\n` +
      `🏆 Milestone: Level ${achievementData.level} — ${achievementData.levelTitle}\n` +
      (achievementData.totalLessons > 0
        ? `✅ Lessons: ${achievementData.completedLessons}/${achievementData.totalLessons} Completed\n`
        : "") +
      `📅 Issued: ${achievementData.completedAt}\n\n` +
      `🚀 Build in-demand tech skills with hands-on projects!\n` +
      `Explore courses & start learning at:\nhttps://lms.qnayds.in/\n\n` +
      `💬 Admissions & Inquiries (WhatsApp):\nhttps://wa.me/919074871204 (+91 9074871204)\n\n` +
      `#QnaydsLMS #Upskill #TechLearning #${achievementData.courseName.replace(/[^a-zA-Z0-9]/g, "")}`
    );
  };

  // WhatsApp formatted share copy
  const getWhatsAppText = () => {
    const isFull = achievementData.isCourseCompleted;
    return (
      `🎉 *${isFull ? "Course Completed!" : "Achievement Unlocked!"} on QNAYDS LMS* 🚀\n\n` +
      `👤 *Student:* ${achievementData.studentName}\n` +
      `📚 *Course:* ${achievementData.courseName}\n` +
      `🏆 *Milestone:* Level ${achievementData.level} — ${achievementData.levelTitle}\n` +
      (achievementData.totalLessons > 0
        ? `✅ *Progress:* ${achievementData.completedLessons}/${achievementData.totalLessons} Lessons Completed\n`
        : "") +
      `📅 *Date:* ${achievementData.completedAt}\n\n` +
      `🚀 *Level up your career with hands-on tech courses:* \nhttps://lms.qnayds.in/\n\n` +
      `💬 *WhatsApp Admissions / Inquiries:*\nhttps://wa.me/919074871204 (+91 9074871204)`
    );
  };

  // 1. Download badge to device
  const handleSaveToGallery = async () => {
    setIsSaving(true);
    showToast("Generating high-res badge...");
    const image = await generateCardImage();
    setIsSaving(false);

    if (!image) return;

    const link = document.createElement("a");
    link.download = image.filename;
    link.href = image.dataUrl;
    link.click();
    showToast("✓ Saved badge to your device!");
  };

  // 2. Primary Hero Share (Web Share API with image file + link + message)
  const handleShare = async () => {
    setIsSharing(true);
    showToast("Preparing share card...");
    const image = await generateCardImage();
    setIsSharing(false);

    if (!image) return;

    const promoMessage = getPromoText();

    // Mobile / native Web Share API
    if (navigator.canShare && navigator.canShare({ files: [image.file] })) {
      try {
        await navigator.share({
          files: [image.file],
          title: `${achievementData.studentName} unlocked Level ${achievementData.level} on QNAYDS LMS!`,
          text: promoMessage,
          url: achievementData.achievementUrl,
        });
        showToast("✓ Shared successfully!");
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    // Desktop fallback: copy image & text to clipboard, then open WhatsApp
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": image.blob }),
        ]);
      }
    } catch {
      // Fallback
    }

    try {
      await navigator.clipboard.writeText(getPromoText());
    } catch {
      // ignore
    }

    showToast("📋 Badge & text copied! Opening WhatsApp...");
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(getWhatsAppText())}`;
    window.open(whatsappUrl, "_blank");
  };

  // 3. Direct WhatsApp Share with OG Logo
  const handleWhatsAppShare = async () => {
    setIsSharing(true);
    showToast("Preparing WhatsApp share...");
    const image = await generateCardImage();
    setIsSharing(false);

    const waText = getWhatsAppText();

    // On mobile, if native share can attach file, trigger native share with image
    if (image && navigator.canShare && navigator.canShare({ files: [image.file] })) {
      try {
        await navigator.share({
          files: [image.file],
          title: `Level ${achievementData.level} on QNAYDS LMS`,
          text: waText,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    // On desktop: copy image to clipboard & auto-download, then open WhatsApp
    if (image) {
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": image.blob }),
          ]);
        }
      } catch {
        // ignore
      }

      const link = document.createElement("a");
      link.download = image.filename;
      link.href = image.dataUrl;
      link.click();
    }

    const url = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    window.open(url, "_blank");
    showToast("✓ Badge saved! Paste into WhatsApp chat.");
  };

  // 4. LinkedIn Share
  const handleLinkedInShare = () => {
    const shareUrl = encodeURIComponent(achievementData.achievementUrl);
    const summary = encodeURIComponent(
      `Excited to have mastered Level ${achievementData.level} (${achievementData.levelTitle}) in ${achievementData.courseName} on QNAYDS LMS!`
    );
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&summary=${summary}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  // 5. Quick Copy Link & Text
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPromoText());
      setCopied(true);
      showToast("🔗 Achievement text & link copied!");
      setTimeout(() => setCopied(false), 2600);
    } catch {
      showToast("❌ Could not copy to clipboard.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={bodyFont}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-hidden select-none"
      onClick={onClose}
    >
      <style>{FONT_IMPORT}</style>

      {/* Celebratory Canvas Confetti */}
      <canvas
        id="qnayds-confetti-canvas"
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      />

      {/* Floating Status Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2 text-xs font-semibold text-white shadow-2xl border border-slate-700/80 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================
          MAIN MODAL CONTAINER (LMS SIGNATURE LIGHT THEME)
      ===================================================== */}
      <div
        className="relative w-full max-w-[420px] sm:max-w-[440px] max-h-[96dvh] flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 text-slate-900 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Badge pill & Close button (No Mode Switch) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              {achievementData.isCourseCompleted ? "Course Completed" : "Milestone Achieved"}
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Modal Heading */}
        <div className="text-center mt-2.5">
          <h2
            style={displayFont}
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight"
          >
            {achievementData.isCourseCompleted
              ? "Course Completed! 🎉"
              : `Level ${achievementData.level} Unlocked! 🎉`}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Great work, <strong className="text-slate-800 font-semibold">{achievementData.studentName}</strong>! You mastered {achievementData.levelTitle}.
          </p>
        </div>

        {/* =====================================================
            CARD PREVIEW (EXPORTABLE PREMIUM LIGHT BADGE)
            Clean, crisp, state-of-the-art LMS design in Light Mode
        ===================================================== */}
        <div className="mt-3 flex justify-center">
          <div
            ref={cardRef}
            className="relative w-full rounded-2xl p-4 text-center overflow-hidden bg-linear-to-b from-white via-sky-50/40 to-slate-50/80 text-slate-900 border border-slate-200 shadow-xl"
          >
            {/* Ambient soft glow elements */}
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-sky-400/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-cyan-300/15 blur-2xl pointer-events-none" />

            {/* Top Brand Header: Matches LMS Navbar branding */}
            <div className="relative flex items-center justify-between pb-2.5 border-b border-slate-200/90 text-[9px]">
              {/* LMS Logo Mark */}
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-600 shadow-xs">
                  <Terminal className="h-3 w-3 text-white" strokeWidth={2.2} />
                </div>
                <div className="text-left leading-none">
                  <span
                    style={displayFont}
                    className="font-bold tracking-tight text-[11.5px] text-slate-900"
                  >
                    QNAYDS
                  </span>
                  <span className="text-[7.5px] uppercase tracking-wider font-semibold text-sky-600 block">
                    Learning Portal
                  </span>
                </div>
              </div>

              {/* Verified Pill */}
              <div className="flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" />
                <span>Verified Milestone</span>
              </div>
            </div>

            {/* Central Milestone Emblem */}
            <div className="relative my-3 flex justify-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/25 ring-4 ring-sky-100">
                <Trophy className="h-7 w-7 text-white drop-shadow" />
                <span
                  style={monoFont}
                  className="absolute -bottom-2.5 rounded-full bg-white text-sky-700 border border-sky-300 px-2 py-0.5 text-[8px] font-bold tracking-wider shadow-xs"
                >
                  LVL {achievementData.level}
                </span>
              </div>
            </div>

            {/* Student Recognition */}
            <div className="relative">
              <p
                style={monoFont}
                className="text-[8px] font-bold uppercase tracking-[1.5px] text-sky-600"
              >
                Official Achievement Credential
              </p>

              <h3
                style={displayFont}
                className="text-lg sm:text-xl font-bold mt-0.5 tracking-tight leading-tight text-slate-900"
              >
                {achievementData.studentName}
              </h3>

              {/* Course & Level Box (Crisp White Card with Slate Border) */}
              <div className="mt-2.5 rounded-xl px-3 py-2 text-left border bg-white border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-[8px] uppercase font-semibold">
                  <span className="flex items-center gap-1 text-slate-500">
                    <BookOpen className="h-2.5 w-2.5 text-sky-600" />
                    Course
                  </span>
                  {achievementData.totalLessons > 0 && (
                    <span
                      style={monoFont}
                      className="text-emerald-600 font-semibold"
                    >
                      {achievementData.completedLessons}/{achievementData.totalLessons} Lessons
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold mt-0.5 leading-snug line-clamp-1 text-slate-900">
                  {achievementData.courseName}
                </p>

                {/* Level Title & Status */}
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[9.5px] text-sky-600 font-medium truncate">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="truncate">{achievementData.levelTitle}</span>
                  </div>
                  <span
                    style={monoFont}
                    className="text-[8px] font-bold text-emerald-600 shrink-0"
                  >
                    100% DONE
                  </span>
                </div>

                {/* Progress Track */}
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-full rounded-full bg-linear-to-r from-sky-500 to-emerald-400" />
                </div>
              </div>

              {/* Date & Credential ID (Monospace LMS Style) */}
              <div
                style={monoFont}
                className="mt-2 flex items-center justify-between text-[8px] border-t pt-2 text-slate-500 border-slate-200"
              >
                <span>Issued: {achievementData.completedAt}</span>
                <span className="text-sky-600 font-semibold">
                  {achievementData.credentialId}
                </span>
              </div>

              {/* Admissions & WhatsApp Contact Strip (Featuring WhatsApp OG Logo) */}
              <div className="mt-2 flex items-center justify-between rounded-lg px-2.5 py-1.5 border text-left bg-emerald-50/70 border-emerald-200/80">
                <div className="flex items-center gap-2">
                  <WhatsAppOGIcon className="h-4.5 w-4.5 shrink-0" />
                  <div>
                    <p className="text-[7.5px] font-bold tracking-wide uppercase text-slate-600">
                      Admissions / Inquiries
                    </p>
                    <p
                      style={monoFont}
                      className="text-[9px] font-bold text-emerald-700 leading-none"
                    >
                      {achievementData.contactNumber}
                    </p>
                  </div>
                </div>

                <span
                  style={monoFont}
                  className="rounded px-1.5 py-0.5 text-[7.5px] font-bold tracking-wider uppercase border bg-white text-emerald-800 border-emerald-200 shadow-2xs"
                >
                  lms.qnayds.in
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SHARE ACTIONS: POLISHED BUTTONS & WHATSAPP OG LOGO
        ===================================================== */}
        <div className="mt-3.5 space-y-2">
          {/* Virality micro-prompt */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Celebrate your win & inspire your network!</span>
          </div>

          {/* PRIMARY HERO ACTION: Share Achievement */}
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSharing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>Share Achievement</span>
              </>
            )}
          </button>

          {/* SECONDARY ROW: WhatsApp (with OG Logo) & Download Badge */}
          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp Direct Share with OG Logo */}
            <button
              onClick={handleWhatsAppShare}
              disabled={isSharing}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] font-bold text-xs py-2 px-3 transition active:scale-[0.98] cursor-pointer shadow-2xs"
              title="Share on WhatsApp"
            >
              <WhatsAppOGIcon className="h-4 w-4 shrink-0" />
              <span>WhatsApp</span>
            </button>

            {/* Save Image to Device */}
            <button
              onClick={handleSaveToGallery}
              disabled={isSaving}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-700 border-t-transparent" />
              ) : (
                <Download className="h-3.5 w-3.5 text-slate-600" />
              )}
              <span>Save Badge</span>
            </button>
          </div>

          {/* TERTIARY ACTIONS ROW: LinkedIn & Copy Link */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={handleLinkedInShare}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-600 hover:text-sky-700 text-xs py-1.5 px-3 transition font-medium cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5 text-[#0a66c2] shrink-0 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.11 20.45H3.56V9h3.55z" />
              </svg>
              <span>Post to LinkedIn</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs py-1.5 px-3 transition font-medium cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy Text & Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
