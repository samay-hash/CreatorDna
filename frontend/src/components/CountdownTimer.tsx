"use client";

import { useState, useEffect } from "react";
import styles from "./CountdownTimer.module.css";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 15, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);

    // Set a target date: 15 days from exactly now (or hardcode a specific date like new Date("2026-07-07T00:00:00"))
    // To make it consistently 15 days for demo, we'll store the target date in sessionStorage or just start at 15 days
    let targetDate = sessionStorage.getItem("launchTargetDate");
    if (!targetDate) {
      targetDate = new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();
      sessionStorage.setItem("launchTargetDate", targetDate);
    }
    
    const targetTime = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={`${styles.countdownWrapper} ${isScrolled ? styles.scatterOut : ''}`}>
      <div className={styles.header}>
        <span className={styles.dot}></span>
        <span className={styles.title}>LAUNCHING IN</span>
      </div>
      
      <div className={styles.timer}>
        <div className={styles.timeBlock}>
          <span className={styles.number} key={`d-${timeLeft.days}`}>
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className={styles.label}>DAYS</span>
        </div>
        
        <span className={styles.separator}>:</span>
        
        <div className={styles.timeBlock}>
          <span className={styles.number} key={`h-${timeLeft.hours}`}>
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className={styles.label}>HRS</span>
        </div>
        
        <span className={styles.separator}>:</span>
        
        <div className={styles.timeBlock}>
          <span className={styles.number} key={`m-${timeLeft.minutes}`}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className={styles.label}>MIN</span>
        </div>
        
        <span className={styles.separator}>:</span>
        
        <div className={styles.timeBlock}>
          {/* Key forces react to re-render the element, triggering the popIn CSS animation every second */}
          <span className={`${styles.number} ${styles.animateSecond}`} key={`s-${timeLeft.seconds}`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className={styles.label}>SEC</span>
        </div>
      </div>
    </div>
  );
}
