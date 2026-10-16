import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { api } from '../../services/api.ts';
import { NotificationItem } from '../../types/index.ts';
import { formatDateTime } from '../../utils/formatters.ts';
import { Link } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      if (res.data?.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      // silent
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full tabular-nums">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-stone-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-stone-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] text-stone-500">({unreadCount} unread)</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">No notifications at this time.</div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.notificationId}
                  className={`p-3 text-xs transition-colors hover:bg-stone-50/70 flex gap-2.5 ${
                    n.isRead ? 'opacity-70 bg-white' : 'bg-emerald-50/20'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      n.priority === 'alert'
                        ? 'bg-rose-500'
                        : n.priority === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-stone-900 truncate">{n.title}</span>
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">{formatDateTime(n.createdAt)}</span>
                    </div>
                    <p className="text-stone-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5 pt-1 border-t border-stone-100/50">
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:underline"
                        >
                          <span>View record</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n.notificationId)}
                          className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-0.5 ml-auto"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 bg-stone-50 border-t border-stone-200 text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold text-emerald-800 hover:underline"
            >
              View all notifications &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
