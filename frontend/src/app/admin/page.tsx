"use client";

import { useState } from "react";
import styles from "./admin.module.css";
import { Trash2, ShieldAlert, Cpu, Activity, Database, LogOut } from "lucide-react";

interface WaitlistEntry {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEntries = async (pwd: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/waitlist/all`, {
        headers: {
          "x-admin-password": pwd,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setEntries(data);
        setIsAuthed(true);
      } else {
        setError("Invalid security clearance.");
      }
    } catch (err) {
      setError("Failed to connect to core servers.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await fetchEntries(password);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to purge this record?")) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/waitlist/${id}`, {
        method: 'DELETE',
        headers: {
          "x-admin-password": password,
        },
      });

      if (res.ok) {
        setEntries(prev => prev.filter(e => e.id !== id));
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleLogout = () => {
    setIsAuthed(false);
    setPassword("");
    setEntries([]);
  };

  if (!isAuthed) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.loginBox}>
          <div className={styles.loginHeader}>
            <ShieldAlert size={32} color="#7c3aed" />
            <h1 className={styles.title}>System Override</h1>
            <p className={styles.subtitle}>CreatorDNA Administrative Access</p>
          </div>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="password"
              placeholder="Enter master override key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              autoFocus
            />
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Authenticating..." : "Authorize"}
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.dashboard}>
        
        {/* Sidebar / Header info */}
        <div className={styles.dashHeader}>
          <div className={styles.dashHeaderLeft}>
            <Cpu size={24} color="#7c3aed" />
            <div>
              <h1 className={styles.title}>Intelligence Control Panel</h1>
              <p className={styles.subtitle}>Active Waitlist Operations</p>
            </div>
          </div>
          <div className={styles.dashHeaderRight}>
            <div className={styles.statBadge}>
              <Activity size={14} /> System Active
            </div>
            <div className={styles.statBadge}>
              <Database size={14} /> Total Records: {entries.length}
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={14} /> Lock Session
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className={styles.tableContainer}>
          {entries.length === 0 ? (
            <div className={styles.empty}>
              <Database size={32} opacity={0.2} />
              <p>No records found in the database.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>UUID</th>
                  <th>Creator Identity</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className={styles.uuidCell}>{entry.id.split('-')[0]}...</td>
                    <td className={styles.emailCell}>{entry.email}</td>
                    <td>
                      <span className={styles.statusBadge}>
                        {entry.status}
                      </span>
                    </td>
                    <td className={styles.dateCell}>{new Date(entry.created_at).toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className={styles.deleteBtn}
                        title="Purge Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
