import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MediaItem } from '../../types';
import { uploadImageFile } from '../../services/dataService';

interface AdminMediaProps {
  mediaItems: MediaItem[];
  onUploadMedia: (file: { file_name: string; file_url: string; storage_path: string; size_bytes: number }) => Promise<void>;
  onDeleteMedia: (id: string) => Promise<void>;
}

export const AdminMedia: React.FC<AdminMediaProps> = ({
  mediaItems,
  onUploadMedia,
  onDeleteMedia,
}) => {
  const [newUrl, setNewUrl] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [notification, setNotification] = useState<{ text: string; success: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setNotification({ text: 'Please select an image file (PNG, JPG, WEBP).', success: false });
      return;
    }

    setUploading(true);
    setNotification(null);
    try {
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        setNotification({ text: `File "${file.name}" uploaded successfully!`, success: true });
      } else {
        setNotification({ text: res.error || 'Failed to upload image.', success: false });
      }
    } catch (err: any) {
      setNotification({ text: err?.message || 'Upload error.', success: false });
    } finally {
      setUploading(false);
    }
  };

  const handleAddMediaUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    setUploading(true);
    const fileName = newFileName || `image-${Date.now()}.jpg`;

    await onUploadMedia({
      file_name: fileName,
      file_url: newUrl.trim(),
      storage_path: `articles/${fileName}`,
      size_bytes: 450000,
    });

    setNewUrl('');
    setNewFileName('');
    setUploading(false);
    setNotification({ text: `Media "${fileName}" saved successfully!`, success: true });
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Media Library & Storage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload banner graphics, university seals, and official campus circular photos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image File</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            notification.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Drag & Drop File Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFileUpload(f);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white p-8 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all ${
          uploading
            ? 'border-sky-400 bg-sky-50/50'
            : dragOver
            ? 'border-sky-500 bg-sky-50 scale-[1.01]'
            : 'border-slate-300 hover:border-sky-400 hover:bg-sky-50/30'
        }`}
      >
        {uploading ? (
          <RefreshCw className="w-10 h-10 text-sky-600 animate-spin mx-auto mb-2" />
        ) : (
          <Upload className="w-10 h-10 text-sky-600 mx-auto mb-2" />
        )}
        <h3 className="text-sm font-bold text-slate-800">
          {uploading ? 'Optimizing & Uploading Image...' : 'Click to Browse or Drag Image Files Here'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Supports PNG, JPG, JPEG, WEBP • Saves directly to storage and media library
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileUpload(f);
            e.target.value = '';
          }}
          className="hidden"
        />
      </div>

      {/* Register External Image URL */}
      <form onSubmit={handleAddMediaUrl} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Or Register External Image URL</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL *</label>
            <input
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://... or CDN URL"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Image Label / Filename</label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. waec-registration-centre.jpg"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>Save External Link</span>
        </button>
      </form>

      {/* Media Items Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Stored Media Assets ({mediaItems.length})
          </h2>
        </div>

        {mediaItems.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">No media items in library yet.</p>
            <p className="text-xs text-slate-400 mt-1">Use the upload box above to upload pictures.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={item.file_url}
                    alt={item.file_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-3">
                  <div className="text-xs font-bold text-slate-800 truncate mb-1" title={item.file_name}>
                    {item.file_name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {item.file_url}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => copyUrl(item.id, item.file_url)}
                      className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteMedia(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded"
                      title="Delete media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
