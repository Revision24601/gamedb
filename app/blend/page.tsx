'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useToast } from '@/components/ToastProvider';
import { FaUsers, FaCopy, FaGamepad, FaExchangeAlt, FaEye, FaPlus } from 'react-icons/fa';

interface Friend {
  id: string;
  name: string;
  gameCount: number;
}

export default function BlendPage() {
  const { showToast } = useToast();
  const [blendCode, setBlendCode] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [codeRes, friendsRes] = await Promise.all([
          fetch('/api/blend/code'),
          fetch('/api/blend/friends'),
        ]);
        if (codeRes.ok) {
          const data = await codeRes.json();
          setBlendCode(data.blendCode);
        }
        if (friendsRes.ok) {
          const data = await friendsRes.json();
          setFriends(data.friends || []);
        }
      } catch (err) {
        console.error('Failed to load blend data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(blendCode);
    showToast('Blend code copied!', 'success');
  };

  const connectFriend = async () => {
    if (!friendCode.trim()) {
      showToast('Enter a blend code', 'warning');
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch('/api/blend/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blendCode: friendCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        setFriendCode('');
        // Refresh friends list
        const friendsRes = await fetch('/api/blend/friends');
        if (friendsRes.ok) {
          const fData = await friendsRes.json();
          setFriends(fData.friends || []);
        }
      } else {
        showToast(data.error, 'error');
      }
    } catch (err) {
      showToast('Failed to connect', 'error');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
          <FaUsers className="text-primary-500" />
          Blend
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Connect with friends to view and compare gaming libraries.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* My Blend Code */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Blend Code</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Share this code with friends so they can connect with you.
              </p>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-mono font-bold tracking-[0.3em] text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-6 py-3 rounded-xl border-2 border-dashed border-primary-200 dark:border-primary-800">
                  {blendCode}
                </div>
                <button onClick={copyCode} className="btn-secondary flex items-center gap-2">
                  <FaCopy className="text-sm" /> Copy
                </button>
              </div>
            </div>

            {/* Connect with friend */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Add a Friend</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Enter your friend&apos;s blend code to connect.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="input flex-1 font-mono text-lg tracking-widest uppercase"
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && connectFriend()}
                />
                <button
                  onClick={connectFriend}
                  disabled={connecting}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaPlus className="text-xs" />
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>

            {/* Friends list */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Connected Friends {friends.length > 0 && `(${friends.length})`}
              </h2>

              {friends.length === 0 ? (
                <div className="card p-8 text-center">
                  <FaUsers className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No friends connected yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Share your blend code to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <span className="text-primary-600 dark:text-primary-400 font-semibold">
                            {friend.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{friend.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FaGamepad className="text-[10px]" />
                            {friend.gameCount} games
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/blend/${friend.id}`}
                          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                        >
                          <FaEye className="text-[10px]" /> Library
                        </Link>
                        <Link
                          href={`/blend/compare/${friend.id}`}
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                        >
                          <FaExchangeAlt className="text-[10px]" /> Compare
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
