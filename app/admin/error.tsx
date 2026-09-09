'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-void)' }}>
      <div 
        className="max-w-md w-full rounded-xl border-2 p-8"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: '#ef4444',
        }}
      >
        <h1 className="text-2xl font-bold text-red-400 mb-4">
          ⚠️ Admin Error
        </h1>
        <div 
          className="p-4 rounded-lg mb-6 font-mono text-sm"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#fca5a5',
          }}
        >
          {error.message || 'An unexpected error occurred'}
        </div>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 border-2 border-cyan-400 text-cyan-400 font-bold uppercase rounded-lg hover:bg-cyan-400 hover:text-void transition-smooth"
          >
            Try Again
          </button>
          <a
            href="/"
            className="block w-full px-6 py-3 text-center border-2 border-muted text-muted font-bold uppercase rounded-lg hover:bg-muted/10 transition-smooth"
            style={{ borderColor: 'var(--border-base)' }}
          >
            Back to Game
          </a>
        </div>
      </div>
    </div>
  );
}
