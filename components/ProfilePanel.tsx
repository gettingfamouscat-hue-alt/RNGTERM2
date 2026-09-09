'use client';

import { useState } from 'react';

interface ProfilePanelProps {
  player: any;
  onClose: () => void;
  onNameChange: (name: string) => void;
}

export function ProfilePanel({ player, onClose, onNameChange }: ProfilePanelProps) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(player.displayName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onNameChange(newName.trim());
      setEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md rounded-2xl border-2 p-6 sm:p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--accent-cyan)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-panel-hover transition-smooth"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">
            <span className="text-cyan-400">&gt;</span> Player Profile
          </h2>
          <p className="text-sm text-muted">Manage your RNGTERM identity</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Player ID */}
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">
              Player ID
            </label>
            <div 
              className="text-xs font-mono p-3 rounded-lg border break-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'var(--border-dim)',
                color: 'var(--text-muted)',
              }}
            >
              {player.id}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">
              Display Name
            </label>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border text-primary focus:border-cyan-400 outline-none transition-smooth"
                  style={{
                    backgroundColor: 'var(--bg-void)',
                    borderColor: 'var(--border-base)',
                  }}
                  maxLength={20}
                  minLength={2}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg border-2 border-cyan-400 text-cyan-400 font-medium hover:bg-cyan-400 hover:text-void transition-smooth btn-press"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setNewName(player.displayName);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg border text-muted hover:bg-panel-hover transition-smooth"
                    style={{ borderColor: 'var(--border-base)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-bold text-primary flex-1">
                  {player.displayName}
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm rounded-lg border text-cyan-400 hover:bg-cyan-400/10 transition-smooth"
                  style={{ borderColor: 'var(--border-base)' }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div 
            className="grid grid-cols-2 gap-4 p-4 rounded-xl border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderColor: 'var(--border-dim)',
            }}
          >
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-1">
                Total EP
              </div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {player.totalEP.toLocaleString()}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-1">
                Last Roll
              </div>
              <div className="text-sm text-primary">
                {player.lastRollAt
                  ? new Date(player.lastRollAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Never'}
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="text-center pt-4 border-t" style={{ borderColor: 'var(--border-dim)' }}>
            <span className="text-xs text-muted">
              Member since {new Date(player.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
