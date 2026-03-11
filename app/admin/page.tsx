"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface EmailEntry {
  email: string;
  activated: boolean;
  activatedAt?: string;
}

interface Stats {
  total: number;
  activated: number;
  pending: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, activated: 0, pending: 0 });
  const [newEmails, setNewEmails] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  const fetchEmails = useCallback(async () => {
    try {
      const res = await fetch(`/api/upload-emails?password=${encodeURIComponent(password)}`);
      const data = await res.json();

      if (res.ok) {
        setEmails(data.emails || []);
        setStats(data.stats || { total: 0, activated: 0, pending: 0 });
      } else {
        showMessage(data.error || "Failed to load emails", "error");
      }
    } catch {
      showMessage("Connection error", "error");
    }
  }, [password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/upload-emails?password=${encodeURIComponent(password)}`);

      if (res.ok) {
        setIsAuthed(true);
        const data = await res.json();
        setEmails(data.emails || []);
        setStats(data.stats || { total: 0, activated: 0, pending: 0 });
      } else {
        showMessage("Invalid password", "error");
      }
    } catch {
      showMessage("Connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmails.trim()) return;

    setLoading(true);
    const emailList = newEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    try {
      const res = await fetch("/api/upload-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: emailList, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage(`Added: ${data.added}, Duplicates: ${data.duplicates}`, "success");
        setNewEmails("");
        fetchEmails();
      } else {
        showMessage(data.error || "Upload failed", "error");
      }
    } catch {
      showMessage("Connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (email: string) => {
    try {
      const res = await fetch("/api/upload-emails", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        showMessage(`Deleted: ${email}`, "success");
        fetchEmails();
      }
    } catch {
      showMessage("Delete failed", "error");
    }
  };

  function showMessage(msg: string, type: "success" | "error") {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }

  useEffect(() => {
    if (isAuthed) {
      fetchEmails();
    }
  }, [isAuthed, fetchEmails]);

  // Login screen
  if (!isAuthed) {
    return (
      <>
        <div className="animated-bg" />
        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <div className="glass-card p-8 w-full max-w-sm">
            <h1 className="text-xl font-bold mb-1 text-center">Admin Panel</h1>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              Enter admin password to continue
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="password"
                className="admin-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                id="admin-password"
              />
              <button type="submit" className="btn-primary" disabled={loading} id="admin-login-btn">
                <span>{loading ? "Checking..." : "Sign In"}</span>
              </button>
            </form>
          </div>

          <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-6">
            ← Back to main page
          </Link>
        </main>
      </>
    );
  }

  // Admin dashboard
  return (
    <>
      <div className="animated-bg" />
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">
                <span className="gemini-gradient">Gemini</span>{" "}
                <span className="text-[var(--text-secondary)]">Admin</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Main page
              </Link>
              <button
                onClick={() => { setIsAuthed(false); setPassword(""); }}
                className="text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
          {/* Message */}
          {message && (
            <div
              className={`px-5 py-3 rounded-14 text-sm font-medium ${
                messageType === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
              style={{ borderRadius: "14px", animation: "fade-in 0.3s ease-out" }}
            >
              {message}
            </div>
          )}

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value gemini-gradient">{stats.total}</div>
              <div className="stat-label">Total Emails</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: "#10b981" }}>{stats.activated}</div>
              <div className="stat-label">Activated</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: "#f59e0b" }}>{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          {/* Upload */}
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold mb-4">Upload Emails</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <textarea
                className="admin-textarea"
                placeholder={"Enter emails (one per line, or separated by commas):\nuser1@company.com\nuser2@company.com"}
                value={newEmails}
                onChange={(e) => setNewEmails(e.target.value)}
                id="upload-textarea"
              />
              <button type="submit" className="btn-primary self-start" disabled={loading} id="upload-btn">
                <span>{loading ? "Uploading..." : "Upload Emails"}</span>
              </button>
            </form>
          </div>

          {/* Email List */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Email Database</h2>
              <button
                onClick={fetchEmails}
                className="text-sm text-[var(--gemini-blue)] hover:underline cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {emails.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] py-8 text-center">
                No emails in database. Upload some above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="email-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Status</th>
                      <th style={{ width: 100 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((entry) => (
                      <tr key={entry.email}>
                        <td className="font-mono text-sm">{entry.email}</td>
                        <td>
                          {entry.activated ? (
                            <span className="badge badge-success">
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                              Activated
                            </span>
                          ) : (
                            <span className="badge badge-pending">
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                              Pending
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(entry.email)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
