import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Bell, CheckCircle, Sparkles } from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function NotificationsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-lg" />
      <div className="space-y-3 mt-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 h-24" />
        ))}
      </div>
    </div>
  );
}

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");

      setNotifications(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return <NotificationsSkeleton />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <style>{FONT_IMPORT}</style>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900" style={display}>
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5" style={mono}>
              {notifications.length} total
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            {unreadCount} unread
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 sm:p-14 text-center">
          <Bell className="w-9 h-9 sm:w-10 sm:h-10 mx-auto text-slate-300" />
          <p className="mt-4 text-slate-500 text-sm sm:text-base">
            No notifications available.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border p-4 sm:p-5 transition ${
                notification.isRead
                  ? "bg-white border-slate-200"
                  : "bg-sky-50/60 border-sky-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  {!notification.isRead && (
                    <span className="mt-2 h-2 w-2 rounded-full bg-sky-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 leading-snug wrap-break-words">
                      {notification.title}
                    </h3>

                    <p className="text-slate-500 text-sm mt-1.5 wrap-break-words">
                      {notification.message}
                    </p>

                    <p
                      className="text-[11px] text-slate-400 mt-3"
                      style={mono}
                    >
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-sky-600 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;