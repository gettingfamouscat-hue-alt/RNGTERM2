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
      <div className="border-2 border-cyan-400 bg-black rounded-lg p-6 max-w-md w-full relative">
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-green-600 hover:text-green-400 transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-cyan-400 mb-6 uppercase tracking-wider">
          &gt; Player Profile
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-green-600 uppercase tracking-wider">Player ID</label>
            <div className="text-green-400 font-mono text-xs mt-1 break-all">
              {player.id}
            </div>
          </div>

          <div>
            <label className="text-sm text-green-600 uppercase tracking-wider">Display Name</label>
            {editing ? (
              <form onSubmit={handleSubmit} className="mt-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-green-500/50 rounded text-green-400 focus:border-green-400 outline-none"
                  maxLength={20}
                  minLength={2}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setNewName(player.displayName);
                    }}
                    className="px-4 py-2 border border-gray-600 text-gray-400 rounded hover:bg-gray-500/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between mt-2">
                <div className="text-green-400 font-bold">{player.displayName}</div>
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1 text-xs border border-green-500/50 rounded text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-green-600 uppercase tracking-wider">Total EP</label>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {player.totalEP.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="text-sm text-green-600 uppercase tracking-wider">Last Roll</label>
            <div className="text-green-400 mt-1">
              {player.lastRollAt
                ? new Date(player.lastRollAt).toLocaleString()
                : 'Never'}
            </div>
          </div>

          <div>
            <label className="text-sm text-green-600 uppercase tracking-wider">Member Since</label>
            <div className="text-green-400 mt-1">
              {new Date(player.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
