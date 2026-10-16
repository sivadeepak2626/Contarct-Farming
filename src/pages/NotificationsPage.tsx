import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { NotificationItem } from '../types/index.ts';
import { formatDateTime } from '../utils/formatters.ts';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.getAll();
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      // silent
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">System Notifications &amp; Alerts</h2>
          <p className="text-xs text-stone-500">
            Real-time compliance alerts regarding upcoming harvests, visits, deliveries, and payment settlements
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs divide-y divide-stone-100 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-xs">Loading notification stream...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs">No notifications found.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notificationId}
              className={`p-4 text-xs transition-colors flex items-start gap-3 ${
                n.isRead ? 'bg-white opacity-80' : 'bg-emerald-50/25'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  n.priority === 'alert'
                    ? 'bg-rose-500'
                    : n.priority === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-stone-900 text-xs">{n.title}</h4>
                  <span className="text-[11px] text-stone-400 whitespace-nowrap">{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">{n.message}</p>

                <div className="flex items-center gap-4 mt-2.5 pt-1.5 border-t border-stone-100">
                  {n.link && (
                    <Link
                      to={n.link}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                    >
                      <span>Navigate to record</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.notificationId)}
                      className="text-[11px] font-medium text-stone-500 hover:text-stone-800 ml-auto flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark as read</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
