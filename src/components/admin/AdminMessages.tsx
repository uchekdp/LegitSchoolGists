import React from 'react';
import { Mail, CheckCircle, Clock, User, Phone } from 'lucide-react';
import { ContactMessage } from '../../types';

interface AdminMessagesProps {
  messages: ContactMessage[];
  onMarkRead: (id: string) => Promise<void>;
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({ messages, onMarkRead }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student & Parent Contact Inquiries
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review questions sent through the public website contact form.
        </p>
      </div>

      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white p-6 rounded-2xl border transition-all ${
                msg.read ? 'border-slate-200' : 'border-sky-300 shadow-md ring-1 ring-sky-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    msg.read ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {msg.read ? 'READ' : 'NEW INQUIRY'}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{msg.subject}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(msg.created_at).toLocaleString('en-GB')}
                  </span>
                  {!msg.read && (
                    <button
                      onClick={() => onMarkRead(msg.id)}
                      className="text-sky-600 hover:text-sky-800 font-bold"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 flex flex-wrap gap-4 mb-3">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {msg.name}
                </span>
                <a href={`mailto:${msg.email}`} className="text-sky-600 underline">
                  {msg.email}
                </a>
                {msg.phone && (
                  <span className="flex items-center gap-1 font-mono text-slate-700">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {msg.phone}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed whitespace-pre-line border border-slate-100">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Mail className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">Inbox is Clear</h3>
          <p className="text-xs text-slate-400 mt-1">No contact messages received yet.</p>
        </div>
      )}
    </div>
  );
};
