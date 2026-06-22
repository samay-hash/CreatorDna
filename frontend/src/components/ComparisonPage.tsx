"use client";
import { useEffect, useRef, useState } from "react";
import styles from "../app/landing.module.css";
import { Check, X, Minus } from "lucide-react";

const tools = ["CreatorDNA", "vidIQ", "TubeBuddy", "Channel Analytics", "YouTube Studio", "Social Blade", "OutlierKit"];


const features = [
  {
    num: "01",
    name: "Creator Clone™",
    desc: "AI learns your unique style and writes scripts in your voice.",
    vals: ["full", "no", "no", "no", "no", "no", "no"],
  },
  {
    num: "02",
    name: "Video Autopsy™",
    desc: "Tells you exactly why a video worked or failed.",
    vals: ["full", "no", "no", "no", "no", "no", "no"],
  },
  {
    num: "03",
    name: "Next Move Engine™",
    desc: "AI gives personalized next video ideas with proof & opportunity score.",
    vals: ["full", "no", "no", "no", "limited", "no", "partial"],
  },
  {
    num: "04",
    name: "Channel DNA™",
    desc: "Deep analysis of your entire channel in one DNA map.",
    vals: ["full", "check", "check", "no", "limited", "basic", "no"],
  },
  {
    num: "05",
    name: "Trend Radar™",
    desc: "Multi-platform trend scanner (YouTube, Reddit, X, Google, News).",
    vals: ["full", "no", "no", "no", "no", "no", "partial"],
  },
  {
    num: "06",
    name: "Content Gap Finder™",
    desc: "Find untapped topics your audience wants but you haven't covered.",
    vals: ["full", "no", "no", "no", "no", "no", "partial"],
  },
  {
    num: "07",
    name: "Upload Predictor™",
    desc: "Predicts performance before you upload (views, CTR, retention).",
    vals: ["full", "no", "no", "no", "no", "no", "no"],
  },
  {
    num: "08",
    name: "Thumbnail DNA™",
    desc: "AI analyzes winning thumbnails & generates ones in your style.",
    vals: ["full", "basic", "basic", "no", "no", "no", "no"],
  },
  {
    num: "09",
    name: "Title Laboratory™",
    desc: "Score, test & generate viral titles in your style.",
    vals: ["full", "check", "check", "basic", "basic", "no", "no"],
  },
  {
    num: "10",
    name: "Audience Persona Engine™",
    desc: "AI builds detailed audience personas & content preferences.",
    vals: ["full", "no", "no", "no", "no", "no", "no"],
  },
];

function CellIcon({ val, isFirst }: { val: string; isFirst: boolean }) {
  if (val === "full") {
    return (
      <div className={styles.cmpCellFull}>
        <Check size={15} strokeWidth={2.5} />
        {isFirst && <span className={styles.cmpOnlyLabel}>Only CreatorDNA</span>}
      </div>
    );
  }
  if (val === "check") {
    return <Check size={17} className={styles.cmpCheckGreen} strokeWidth={2} />;
  }
  if (val === "limited") {
    return (
      <div className={styles.cmpCellPartial}>
        <Minus size={14} strokeWidth={2.5} />
        <span className={styles.cmpPartialLabel}>Limited</span>
      </div>
    );
  }
  if (val === "basic") {
    return (
      <div className={styles.cmpCellPartial}>
        <Minus size={14} strokeWidth={2.5} />
        <span className={styles.cmpPartialLabel}>Basic</span>
      </div>
    );
  }
  return <X size={16} className={styles.cmpCheckNo} strokeWidth={2} />;
}

interface ComparisonPageProps {
  onWaitlistClick?: () => void;
}

export function ComparisonPage({ onWaitlistClick }: ComparisonPageProps) {
  const elemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add(styles.rowVisible)),
      { threshold: 0.08 }
    );
    elemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.cmpPage}>
      {/* HEADER */}
      <div
        className={`${styles.cmpHeader} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[0] = el; }}
      >
        <span className={styles.featureTag}>WHY CREATORDNA IS DIFFERENT</span>
        <h2 className={styles.cmpTitle}>
          Not another{" "}
          <span className={`${styles.featurePageAccent} ${styles.hoverCurve}`}>analytics tool.</span>
        </h2>
        <p className={styles.cmpSubtitle}>
          The most advanced AI platform built exclusively for YouTube creators. While others show you data, we give you decisions.
        </p>
      </div>

      {/* TABLE */}
      <div
        className={`${styles.cmpTableWrap} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[1] = el; }}
        style={{ transitionDelay: "100ms" }}
      >
        <table className={styles.cmpTable}>
          <thead>
            <tr>
              <th className={styles.cmpThFeature}>FEATURES</th>
              {tools.map((tool, i) => (
                <th
                  key={tool}
                  className={`${styles.cmpTh} ${i === 0 ? styles.cmpThHighlight : ""}`}
                >
                  {i === 0 && <div className={styles.cmpThBadge}>Our Tool</div>}
                  <span>{tool.toUpperCase()}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feat, ri) => (
              <tr key={feat.name} className={styles.cmpRow}>
                <td className={styles.cmpTdFeature}>
                  <div className={styles.cmpFeatName}>
                    <span className={styles.cmpFeatNum}>{feat.num}</span>
                    <span className={styles.cmpFeatTitle}>{feat.name}</span>
                  </div>
                </td>
                {feat.vals.map((val, ci) => (
                  <td
                    key={ci}
                    className={`${styles.cmpTd} ${ci === 0 ? styles.cmpTdHighlight : ""}`}
                  >
                    <CellIcon val={val} isFirst={ci === 0} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BOTTOM TAGLINE */}
      <div
        className={`${styles.cmpTagline} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[2] = el; }}
        style={{ transitionDelay: "200ms" }}
      >
        <div className={styles.cmpTaglineText}>
          <h2 className={styles.cmpTaglineMain}>CreatorDNA isn't just another tool.</h2>
          <p className={styles.cmpTaglineSub}>It's the intelligence layer your channel has been missing.</p>
        </div>
        <button className={styles.ctaBtn} onClick={onWaitlistClick}>Join the Waitlist →</button>
      </div>
    </section>
  );
}
