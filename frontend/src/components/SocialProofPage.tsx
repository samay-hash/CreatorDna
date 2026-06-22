"use client";
import { useEffect, useRef, useState } from "react";
import styles from "../app/landing.module.css";

const stats = [
  { num: "01", label: "Beta Invites Remaining" },
  { num: "50M+", label: "Videos Analyzed" },
  { num: "95%",  label: "Prediction Accuracy" },
  { num: "24/7", label: "Real-time Intelligence" },
];

const testimonials = [
  {
    quote: "I used to guess what to make next. Now I know.",
    name: "Aryan S.",
    sub: "255K subscribers · Football Creator",
  },
  {
    quote: "CreatorDNA showed me why 3 of my videos flopped. Changed my entire strategy.",
    name: "Priya M.",
    sub: "180K subscribers · Finance Creator",
  },
  {
    quote: "The Next Move Engine alone is worth it. Every idea comes with proof.",
    name: "Dev K.",
    sub: "490K subscribers · Tech Creator",
  },
];

function useCountUp(target: number, duration = 1800, started: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return count;
}

interface SocialProofPageProps {
  onWaitlistClick?: () => void;
}

export function SocialProofPage({ onWaitlistClick }: SocialProofPageProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const elemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { setVisible(true); e.target.classList.add(styles.rowVisible); }
      }),
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    elemRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className={styles.proofPage} ref={sectionRef}>

      {/* HEADER */}
      <div
        className={`${styles.proofHeader} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[0] = el; }}
      >
        <span className={styles.featureTag}>TRUSTED BY CREATORS</span>
        <h2 className={styles.proofTitle}>
          Creators who want to{" "}
          <span className={styles.featurePageAccent}>grow, not guess.</span>
        </h2>
      </div>

      {/* STATS ROW */}
      <div
        className={`${styles.proofStats} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[1] = el; }}
        style={{ transitionDelay: "80ms" }}
      >
        {stats.map((s) => (
          <div key={s.label} className={styles.proofStatItem}>
            <span className={styles.proofStatNum}>{s.num}</span>
            <span className={styles.proofStatLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* TESTIMONIAL CARDS */}
      <div
        className={`${styles.proofCards} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[2] = el; }}
        style={{ transitionDelay: "160ms" }}
      >
        {testimonials.map((t, i) => (
          <div key={i} className={styles.proofCard}>
            <p className={styles.proofQuote}>&ldquo;{t.quote}&rdquo;</p>
            <div className={styles.proofAuthor}>
              <div className={styles.proofAvatar}>{t.name[0]}</div>
              <div>
                <div className={styles.proofName}>{t.name}</div>
                <div className={styles.proofSub}>{t.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* WAITLIST STRIP */}
      <div
        className={`${styles.proofWaitlist} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[3] = el; }}
        style={{ transitionDelay: "240ms" }}
      >
        <div className={styles.proofWaitlistText}>
          <span className={styles.proofWaitlistTitle}>Stop Guessing. Start Growing.</span>
          <span className={styles.proofWaitlistSub}>
            Join the waitlist and be the first to experience the future of creator intelligence.
          </span>
        </div>
        <div className={styles.proofWaitlistAction}>
          <button className={styles.proofWaitlistBtn} onClick={onWaitlistClick}>Join the Waitlist →</button>
          <span className={styles.proofWaitlistMeta}>Limited early access · No credit card required</span>
        </div>
      </div>

    </section>
  );
}
