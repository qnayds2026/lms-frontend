import { useRef, useState, useEffect, useMemo } from "react";
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
  ExternalLink,
  ShieldCheck,
  Flame,
  BookOpen,
} from "lucide-react";
import QNAYDS_LOGO from "../../assets/logo/QNAYDS_LOGO.png";

// =====================================================
// FONTS & STYLES (MATCHING QNAYDS LMS DESIGN SYSTEM)
// =====================================================
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');`;

const displayFont = { fontFamily: "'Space Grotesk', sans-serif" };
const monoFont = { fontFamily: "'JetBrains Mono', monospace" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

/**
 * Helper to format date cleanly in standard LMS style
 */
const formatMilestoneDate = (dateVal) => {
  try {
    const d = dateVal ? new Date(dateVal) : new Date();
    if (isNaN(d.getTime())) return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }
};

/**
 * ACHIEVEMENT POPUP COMPONENT (QNAYDS LMS UI / UX ALIGNED)
 * Triggered when a student completes a course level or clicks to share milestone achievements
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

  // Get current logged-in user from prop or localStorage
  const activeUser = useMemo(() => {
    if (propUser && (propUser.name || propUser.fullName)) return propUser;
    try {
      const stored = localStorage.getItem("user");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return null;
  }, [propUser]);

  // Combine and normalize course level data from API response objects & props
  const achievementData = useMemo(() => {
    // Determine level info from levelData or module
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
      "Professional Certification";

    const courseId = customData?.courseId || courseObj.id || progObj.courseId || "";

    const level = customData?.level ?? targetModule.level ?? 1;

    const levelTitle =
      customData?.levelTitle ||
      targetModule.title ||
      (level ? `Level ${level} Mastery` : "Course Milestone");

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
      progObj.isCompleted ??
      (progObj.totalLessons > 0 && progObj.completedLessons >= progObj.totalLessons);

    const completedAt =
      customData?.completedAt ||
      formatMilestoneDate(targetModule.completedAt || progObj.completedAt || new Date());

    // Generate unique verification credential ID if certificate doesn't have one
    const certificateNumber =
      certificate?.certificateNumber ||
      customData?.credentialId;

    const credentialId =
      certificateNumber ||
      `QNY-${String(courseId || "CRS").toUpperCase()}-L${level}-${Math.abs(
        (Number(courseId) || 101) * 31 + Number(level) * 17 + (activeUser?.id || 1) * 7
      )
        .toString()
        .padStart(4, "0")
        .slice(-4)}`;

    // Shareable LMS link & admissions contact
    const achievementUrl = "https://lms.qnayds.in/";
    const contactNumber = "9074871204";
    const whatsappContactUrl = "https://wa.me/919074871204";

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
      achievementUrl,
      contactNumber,
      whatsappContactUrl,
      platformName: customData?.platformName || "Qnayds LMS",
    };
  }, [customData, course, module, levelData, progress, activeUser, certificate]);

  // Toast feedback
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Celebration confetti pops using Qnayds LMS brand colors (Sky, Emerald, Gold, Indigo)
  useEffect(() => {
    if (!isOpen) return;

    const canvas = document.getElementById("qnayds-confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles = [];
    const colors = [
      "#0284c7", // sky-600
      "#38bdf8", // sky-400
      "#10b981", // emerald-500
      "#34d399", // emerald-400
      "#f59e0b", // amber-500
      "#fbbf24", // amber-400
      "#6366f1", // indigo-500
      "#ffffff", // white
    ];

    for (let i = 0; i < 85; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 80,
        y: height / 2 - 30,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 1.4) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
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
        p.vy += 0.38; // gravity
        p.vx *= 0.98; // drag
        p.rotation += p.rSpeed;
        if (frame > 22) p.opacity -= 0.015;

        if (p.opacity > 0) {
          active = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });

      frame++;
      if (active && frame < 130) {
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

  // High-resolution image generation for export & social cards
  const generateCardImage = async () => {
    if (!cardRef.current) return null;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2.8,
        cacheBust: true,
        quality: 0.98,
        backgroundColor: "#090d16",
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const sanitizedName = achievementData.studentName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      const filename = `${sanitizedName}-level-${achievementData.level}-badge.png`;
      const file = new File([blob], filename, { type: "image/png" });
      return { dataUrl, blob, file, filename };
    } catch (err) {
      console.error("Error generating achievement card:", err);
      showToast("❌ Could not generate achievement badge image.");
      return null;
    }
  };

  // High-converting promotional copy promoting the LMS
  const getPromoText = () => {
    const isFull = achievementData.isCourseCompleted;
    return (
      `🎓 ${isFull ? "Course Completed!" : "Milestone Achieved!"} on ${achievementData.platformName} 🚀\n\n` +
      `👤 Student: ${achievementData.studentName}\n` +
      `📚 Course: ${achievementData.courseName}\n` +
      `🏆 Milestone: Level ${achievementData.level} — ${achievementData.levelTitle}\n` +
      (achievementData.totalLessons > 0 ? `📖 Progress: ${achievementData.completedLessons}/${achievementData.totalLessons} Lessons Completed\n` : "") +
      `📅 Issued: ${achievementData.completedAt}\n\n` +
      `✨ Master in-demand tech skills with hands-on projects!\n` +
      `🚀 Explore courses & start learning at:\nhttps://lms.qnayds.in/\n\n` +
      `💬 Contact / Admissions on WhatsApp:\nhttps://wa.me/919074871204 (+91 9074871204)\n\n` +
      `#QnaydsLMS #LearnToCode #${achievementData.courseName.replace(/[^a-zA-Z0-9]/g, "")} #Upskill`
    );
  };

  // WhatsApp formatted promotional share copy
  const getWhatsAppText = () => {
    return (
      `🎉 *Achievement Unlocked on ${achievementData.platformName}!* 🚀\n\n` +
      `👤 *Student:* ${achievementData.studentName}\n` +
      `📚 *Course:* ${achievementData.courseName}\n` +
      `🏆 *Milestone:* Level ${achievementData.level} • ${achievementData.levelTitle}\n` +
      (achievementData.totalLessons > 0 ? `✅ *Progress:* ${achievementData.completedLessons}/${achievementData.totalLessons} Lessons Completed\n` : "") +
      `📅 *Date:* ${achievementData.completedAt}\n\n` +
      `🚀 *Level up your tech career! Explore courses & start learning:* \nhttps://lms.qnayds.in/\n\n` +
      `💬 *Contact / Admissions on WhatsApp:*\nhttps://wa.me/919074871204 (+91 9074871204)`
    );
  };

  // 1. Download card directly to gallery / downloads
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
          title: `${achievementData.studentName} unlocked Level ${achievementData.level} on ${achievementData.platformName}!`,
          text: promoMessage,
          url: achievementData.achievementUrl,
        });
        showToast("✓ Shared successfully!");
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    // Desktop fallback: copy image to clipboard & open share dialog
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": image.blob }),
        ]);
        showToast("📋 Badge copied to clipboard! Paste directly into chat.");
      }
    } catch (e) {
      // Fallback
    }

    // Open WhatsApp Web with complete promotional payload
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(getWhatsAppText())}`;
    window.open(whatsappUrl, "_blank");
  };

  // 3. Direct WhatsApp Share
  const handleWhatsAppShare = async () => {
    setIsSharing(true);
    showToast("Opening WhatsApp...");
    const image = await generateCardImage();
    setIsSharing(false);

    const waText = getWhatsAppText();

    if (image && navigator.canShare && navigator.canShare({ files: [image.file] })) {
      try {
        await navigator.share({
          files: [image.file],
          title: `Level ${achievementData.level} on ${achievementData.platformName}`,
          text: waText,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    // Desktop: copy image and download, then open WhatsApp
    if (image) {
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": image.blob }),
          ]);
        }
      } catch (e) {}

      const link = document.createElement("a");
      link.download = image.filename;
      link.href = image.dataUrl;
      link.click();
    }

    const url = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    window.open(url, "_blank");
  };

  // 4. Quick Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPromoText());
      setCopied(true);
      showToast("🔗 Achievement link & text copied!");
      setTimeout(() => setCopied(false), 2600);
    } catch (err) {
      showToast("❌ Could not copy to clipboard.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={bodyFont}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-hidden select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <style>{FONT_IMPORT}</style>

      {/* Celebration Confetti Canvas (LMS Brand Colors) */}
      <canvas
        id="qnayds-confetti-canvas"
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      />

      {/* Floating Status Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2 text-xs font-semibold text-white shadow-2xl border border-slate-700/80 backdrop-blur-sm animate-bounce">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODAL CARD: QNAYDS LMS THEMED CONTAINER */}
      <div
        className="relative w-full max-w-[400px] sm:max-w-[420px] max-h-[96dvh] flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 text-slate-900 shadow-2xl animate-in zoom-in-95 duration-150 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Badge pill & Close button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-200">
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {achievementData.isCourseCompleted ? "Course Completed" : "Level Mastered"}
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Modal Subheading */}
        <div className="text-center mt-2.5">
          <h2 style={displayFont} className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
            {achievementData.isCourseCompleted
              ? "Course Completed! 🎉"
              : `Level ${achievementData.level} Unlocked! 🎉`}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Congratulations, <strong className="text-slate-800 font-semibold">{achievementData.studentName}</strong>! You mastered {achievementData.levelTitle}.
          </p>
        </div>

        {/* =====================================================
            CARD PREVIEW (EXPORTABLE PREMIUM QNAYDS LMS BADGE)
            Captured via html-to-image with zero external styling flaws
        ===================================================== */}
        <div className="mt-3 flex justify-center">
          <div
            ref={cardRef}
            className="relative w-full rounded-2xl bg-linear-to-br from-[#0a1120] via-[#0f172a] to-[#1e1b4b] text-white p-4 text-center overflow-hidden shadow-xl border border-slate-800"
          >
            {/* Subtle decorative grid and radial glow */}
            <div
              className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-sky-500/15 blur-2xl pointer-events-none"
            />
            <div
              className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none"
            />

            {/* Top Brand & Accredited Ribbon */}
            <div className="relative flex items-center justify-between pb-2 border-b border-slate-800/80 text-[9px]">
              <div className="flex items-center gap-1.5">
                <img
                  src={QNAYDS_LOGO}
                  alt="Qnayds Logo"
                  className="h-4 w-auto object-contain brightness-125"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <span style={displayFont} className="font-extrabold tracking-wider uppercase text-white text-[10px]">
                  {achievementData.platformName}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-emerald-500/15 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 text-[8px]">
                <ShieldCheck className="h-2.5 w-2.5" />
                <span>Milestone Achieved</span>
              </div>
            </div>

            {/* Central Trophy Icon & Level Indicator */}
            <div className="relative my-3 flex justify-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/30 ring-4 ring-sky-400/20">
                <Trophy className="h-7 w-7 text-white drop-shadow" />
                <span
                  style={monoFont}
                  className="absolute -bottom-2 rounded-full bg-slate-950 text-sky-400 border border-sky-400/40 px-2 py-0.5 text-[8px] font-bold tracking-wider shadow-sm"
                >
                  LVL {achievementData.level}
                </span>
              </div>
            </div>

            {/* Student Recognition */}
            <div className="relative">
              <p className="text-[8px] font-bold uppercase tracking-[2px] text-sky-400/90">
                Official Achievement Certificate
              </p>
              <h3
                style={displayFont}
                className="text-lg sm:text-xl font-bold text-white mt-0.5 tracking-tight leading-tight"
              >
                {achievementData.studentName}
              </h3>

              {/* Course & Level Box */}
              <div className="mt-2 rounded-xl bg-slate-900/80 border border-slate-800 px-3 py-2 text-left">
                <div className="flex items-center justify-between text-[8px] text-slate-400 uppercase font-semibold">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-2.5 w-2.5 text-sky-400" />
                    Course
                  </span>
                  {achievementData.totalLessons > 0 && (
                    <span className="text-emerald-400 font-mono">
                      {achievementData.completedLessons}/{achievementData.totalLessons} Lessons
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-white mt-0.5 leading-snug line-clamp-1">
                  {achievementData.courseName}
                </p>

                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-sky-300 font-medium">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span className="line-clamp-1">{achievementData.levelTitle}</span>
                </div>
              </div>

              {/* Date & LMS Portal Link */}
              <div
                style={monoFont}
                className="mt-2 flex items-center justify-between text-[8px] text-slate-400 border-t border-slate-800/80 pt-2"
              >
                <span>{achievementData.completedAt}</span>
                <span className="text-sky-300 font-medium tracking-wide">
                  lms.qnayds.in
                </span>
              </div>

              {/* Contact / Admissions Section (Replacing Verify Section) */}
              <div className="mt-2 flex items-center justify-between bg-slate-900/90 rounded-lg px-2.5 py-1.5 border border-slate-800 text-left">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#25D366]/20 text-[#25D366] shrink-0">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
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
                  </div>
                  <div>
                    <p className="text-[7.5px] font-bold text-slate-300 tracking-wide uppercase">
                      Contact / Inquiries
                    </p>
                    <p style={monoFont} className="text-[9px] text-emerald-400 font-bold tracking-wider leading-tight">
                      +91 9074871204
                    </p>
                  </div>
                </div>

                <span
                  style={monoFont}
                  className="rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 text-[7.5px] font-bold tracking-wider uppercase"
                >
                  lms.qnayds.in
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SHARE ACTIONS: MATCHING LMS COLOR PALETTE & BUTTONS
        ===================================================== */}
        <div className="mt-3.5 space-y-2">
          {/* Virality micro-prompt */}
          <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Celebrate your win & inspire fellow students!</span>
          </div>

          {/* PRIMARY HERO ACTION: Share Achievement */}
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 transition-all shadow-md shadow-sky-600/20 active:scale-98 disabled:opacity-50 cursor-pointer"
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

          {/* SECONDARY ROW: WhatsApp & Download Badge */}
          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 font-semibold text-xs py-2 px-3 transition-colors active:scale-98 cursor-pointer"
              title="Share to WhatsApp"
            >
              <svg
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
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
              <span>WhatsApp</span>
            </button>

            {/* Save Image to Device */}
            <button
              onClick={handleSaveToGallery}
              disabled={isSaving}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3 transition-colors active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-700 border-t-transparent" />
              ) : (
                <Download className="h-3.5 w-3.5 text-slate-600" />
              )}
              <span>Save Badge</span>
            </button>
          </div>

          {/* Bottom Action: Copy Link */}
          <div className="flex items-center justify-center pt-1 text-xs">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-slate-500 hover:text-sky-600 transition-colors font-medium cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy share link & text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
