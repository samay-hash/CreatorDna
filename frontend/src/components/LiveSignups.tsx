"use client";

import { useEffect, useState } from "react";
import styles from "../app/landing.module.css";
import { UserPlus } from "lucide-react";

export function LiveSignups() {
  const [names, setNames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fetch recent signups
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/waitlist/recent`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setNames(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (names.length === 0) return;

    // Show first name shortly after loading
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Loop through names every 7 seconds (5.5s visible, 1.5s hidden transition)
    const interval = setInterval(() => {
      setIsVisible(false); // hide current
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % names.length);
        setIsVisible(true); // show next
      }, 1500); // Wait 1.5s before showing next one to allow smooth fade out
      
    }, 7000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [names]);

  if (names.length === 0) return null;

  return (
    <div className={`${styles.liveSignupToast} ${isVisible ? styles.toastVisible : ""}`}>
      <div className={styles.toastIconBox}>
        <UserPlus size={16} color="#7c3aed" />
      </div>
      <div className={styles.toastContent}>
        <span className={styles.toastName}>{names[currentIndex]}</span>
        <span className={styles.toastAction}>just joined the waitlist!</span>
      </div>
    </div>
  );
}
