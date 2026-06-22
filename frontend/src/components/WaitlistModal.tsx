"use client";

import { useState } from "react";
import { X, CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import styles from "../app/landing.module.css";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number | null;
}

export function WaitlistModal({ isOpen, onClose, count }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [localCount, setLocalCount] = useState<number | null>(null);

  // Sync with prop when modal opens
  const displayCount = localCount !== null ? localCount : count;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Successfully joined!");
        if (data.count) {
          setLocalCount(data.count);
        } else {
          setLocalCount(displayCount + 1);
        }
      } else {
        setStatus("error");
        setMessage(data.detail?.[0]?.msg || data.detail || "Something went wrong.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <button className={styles.modalClose} onClick={onClose}>
          <X size={24} />
        </button>

        {status === "success" ? (
          <div className={styles.modalSuccess}>
            <CheckCircle size={48} className={styles.successIcon} />
            <h2>You're In!</h2>
            <p>{message}</p>
            <button className={styles.modalSuccessBtn} onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className={styles.modalTitle}>Join the Waitlist</h2>
            <p className={styles.modalSub}>
              Be the first to know when we open doors to new creators.
            </p>
            
            <div className={styles.modalCountRow}>
              <div className={styles.avatarStack}>
                <Image src="https://i.pravatar.cc/100?img=33" alt="User 1" width={24} height={24} className={styles.avatarMini} />
                <Image src="https://i.pravatar.cc/100?img=47" alt="User 2" width={24} height={24} className={styles.avatarMini} />
                <Image src="https://i.pravatar.cc/100?img=12" alt="User 3" width={24} height={24} className={styles.avatarMini} />
              </div>
              <div className={styles.modalCountText}>
                {displayCount === null ? (
                  <span style={{ opacity: 0.6 }}>Loading count...</span>
                ) : (
                  <>
                    <span className={styles.countNumber}>{displayCount.toLocaleString()}</span> creators already joined
                  </>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.modalInput}
                disabled={status === "loading"}
              />
              <button 
                type="submit" 
                className={styles.modalSubmit}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Joining..." : "Join Now"} <ArrowRight size={18} />
              </button>
              {status === "error" && <p className={styles.modalError}>{message}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
