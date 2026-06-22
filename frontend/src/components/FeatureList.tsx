"use client";
import { useEffect, useRef } from "react";
import styles from "../app/landing.module.css";
import { Dna, Search, Target, Feather, Radar, Scan, TrendingUp } from "lucide-react";

const features = [
  {
    num: "01",
    icon: <Dna size={22} />,
    title: "Channel DNA",
    sub: "Understand what your audience truly responds to",
    tags: ["Outperforming topics", "Hidden opportunities", "Preference shifts"],
  },
  {
    num: "02",
    icon: <Search size={22} />,
    title: "Video Autopsy",
    sub: "Every video leaves clues. We surface them.",
    tags: ["Why it worked", "Drop-off moments", "Repeat patterns"],
  },
  {
    num: "03",
    icon: <Target size={22} />,
    title: "Next Move Engine",
    sub: "Answers the one question every creator asks",
    tags: ["High-potential topics", "Demand signals", "Strategic directions"],
  },
  {
    num: "04",
    icon: <Feather size={22} />,
    title: "Creator Style DNA",
    sub: "Your voice, your audience. Not generic AI.",
    tags: ["Hook patterns", "Story structure", "Pacing & emotion"],
  },
  {
    num: "05",
    icon: <Radar size={22} />,
    title: "Trend Radar",
    sub: "Spot trends before they peak, across platforms.",
    tags: ["YouTube & Reddit", "Early signals", "Cross-platform intel"],
  },
  {
    num: "06",
    icon: <Scan size={22} />,
    title: "Content Gap Finder",
    sub: "The biggest growth is hiding in plain sight.",
    tags: ["Competitor blind spots", "Underserved topics", "Audience demand"],
  },
  {
    num: "07",
    icon: <TrendingUp size={22} />,
    title: "Upload Predictor",
    sub: "Know performance before you press publish.",
    tags: ["Estimated CTR & views", "Best upload time", "Viral probability"],
  },
];

export function FeatureList() {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.rowVisible);
          }
        });
      },
      { threshold: 0.15 }
    );

    rowRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.featurePage}>
      {/* HEADER */}
      <div className={styles.featurePageHeader}>
        <span className={styles.featureTag}>WHY CREATORDNA</span>
        <h2 className={styles.featurePageTitle}>
          Most tools show numbers.{" "}
          <span className={styles.featurePageAccent}>We show decisions.</span>
        </h2>
        <p className={styles.featurePageSub}>
          CreatorDNA reads your entire content history and turns it into your next move.
        </p>
      </div>

      {/* FEATURE ROWS */}
      <div className={styles.featureRows}>
        {features.map((f, i) => (
          <div
            key={f.num}
            className={styles.featureRow}
            ref={(el) => { rowRefs.current[i] = el; }}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            {/* LEFT: Big number */}
            <div className={styles.featureRowNum}>{f.num}</div>

            {/* DIVIDER */}
            <div className={styles.featureRowDivider} />

            {/* RIGHT: Content */}
            <div className={styles.featureRowContent}>
              <div className={styles.featureRowIcon}>{f.icon}</div>
              <div className={styles.featureRowInfo}>
                <h3 className={styles.featureRowTitle}>{f.title}</h3>
                <p className={styles.featureRowSub}>{f.sub}</p>
              </div>
              <div className={styles.featureRowTags}>
                {f.tags.map((tag) => (
                  <span key={tag} className={styles.featureRowTag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
