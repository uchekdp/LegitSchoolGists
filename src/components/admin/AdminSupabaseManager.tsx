import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  Layers,
  Terminal
} from 'lucide-react';
import { SUPABASE_SQL_SCRIPT } from '../../data/sqlScript';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials, 
  testSupabaseConnection 
} from '../../lib/supabaseClient';

export const AdminSupabaseManager: React.FC = () => {
  const currentConfig = getSupabaseCredentials();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url, anonKey);
    setTestResult(res);
    setTesting(false);

    if (res.success) {
      saveSupabaseCredentials(url, anonKey);
    }
  };

  const handleReset = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Phase 3 & 4
            </span>
            <span className="text-xs font-semibold text-slate-500">PostgreSQL Backend Integration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Supabase Backend Connection & SQL Script Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect your live Supabase project and execute the complete production SQL schema.
          </p>
        </div>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span>Open Supabase Dashboard</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Supabase Connection Setup Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-base">
              Supabase Project API Credentials
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {currentConfig.isConfigured ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Connection
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Offline / Local Cache Active
              </span>
            )}
          </div>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project URL (e.g. https://yourprojectid.supabase.co) *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Anon / Public API Key *
            </label>
            <textarea
              required
              rows={2}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={testing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>{testing ? 'Verifying...' : 'Save & Test Connection'}</span>
            </button>

            {currentConfig.isConfigured && (
              <button
                type="button"
                onClick={handleReset}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl"
              >
                Disconnect & Use Local Mode
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SQL Script Generator Box */}
      <div className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h2 className="font-extrabold text-white text-base">
                Production PostgreSQL Schema & RLS Script
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Includes table creation, RLS security policies, triggers, indexes, and initial seeds.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 shrink-0"
          >
            {copiedScript ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
            <span>{copiedScript ? 'SQL SCRIPT COPIED!' : 'COPY FULL SQL SCRIPT'}</span>
          </button>
        </div>

        {/* 3 Step Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700">
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Step 1: Copy Script</span>
            <p className="text-slate-300">Click the "Copy Full SQL Script" button above.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Step 2: Open SQL Editor</span>
            <p className="text-slate-300">Go to your Supabase project dashboard and click "SQL Editor" in the left sidebar.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Step 3: Run Query</span>
            <p className="text-slate-300">Paste the script into a new query and click "Run". All tables & RLS will be initialized.</p>
          </div>
        </div>

        {/* Quick Permissions & RLS Patch Card */}
        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Already created tables? Run Quick Permission Patch:</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              If articles don't save to Supabase backend due to RLS policies, copy and run this 3-line patch in Supabase SQL editor:
            </p>
            <code className="text-[10px] text-amber-300 font-mono block mt-1 bg-slate-950 px-2.5 py-1 rounded">
              CREATE POLICY "Full access to articles" ON public.articles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
            </code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`DROP POLICY IF EXISTS "Full access to articles" ON public.articles;\nDROP POLICY IF EXISTS "Authenticated users have full access to articles" ON public.articles;\nCREATE POLICY "Full access to articles" ON public.articles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`);
              setCopiedScript(true);
              setTimeout(() => setCopiedScript(false), 2500);
            }}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Permission Fix</span>
          </button>
        </div>

        {/* Script Viewer Codebox */}
        <div className="relative">
          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
            {SUPABASE_SQL_SCRIPT}
          </pre>
        </div>
      </div>
    </div>
  );
};
