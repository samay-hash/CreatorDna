"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "../app/landing.module.css";

export function VideoAutopsyPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const elemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.rowVisible);
          }
        });
      },
      { threshold: 0.1 }
    );
    elemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.autopsyPage}>
      {/* HEADER */}
      <div
        className={`${styles.autopsyHeader} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[0] = el; }}
      >
        <span className={styles.featureTag}>VIDEO AUTOPSY</span>
        <h2 className={styles.autopsyTitle}>
          Every video has a story.{" "}
          <span className={styles.featurePageAccent}>We decode it.</span>
        </h2>
        <p className={styles.autopsySubtitle}>
          CreatorDNA doesn't just show you metrics — it tells you exactly why a video succeeded or failed, and what to do next.
        </p>
      </div>

      {/* TWO VIDEO CARDS SIDE BY SIDE */}
      <div
        className={`${styles.autopsyCards} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[1] = el; }}
        style={{ transitionDelay: "100ms" }}
      >
        {/* HIGH PERFORMER */}
        <Image
          src="/greeen.png"
          alt="Transfer Story — High Performer"
          width={800}
          height={450}
          style={{ width: "100%", height: "auto", borderRadius: "0" }}
        />

        {/* LOW PERFORMER */}
        <Image
          src="/red.png"
          alt="Tactical Analysis — Low Performer"
          width={800}
          height={450}
          style={{ width: "100%", height: "auto", borderRadius: "0" }}
        />
      </div>

      {/* MICRO INSIGHTS ROW */}
      <div
        className={`${styles.autopsyInsights} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[2] = el; }}
        style={{ transitionDelay: "180ms" }}
      >
        <div className={styles.autopsyInsightItem}>
          <span className={styles.autopsyInsightNum}>9.2</span>
          <span className={styles.autopsyInsightLabel}>DNA Score</span>
          <span className={styles.autopsyInsightSub}>Transfer Story</span>
        </div>
        <div className={styles.autopsyInsightDivider} />
        <div className={styles.autopsyInsightItem}>
          <span className={styles.autopsyInsightNum}>2.1M</span>
          <span className={styles.autopsyInsightLabel}>Views</span>
          <span className={styles.autopsyInsightSub}>vs 52K</span>
        </div>
        <div className={styles.autopsyInsightDivider} />
        <div className={styles.autopsyInsightItem}>
          <span className={styles.autopsyInsightNum}>12.6%</span>
          <span className={styles.autopsyInsightLabel}>Engagement</span>
          <span className={styles.autopsyInsightSub}>vs 1.6%</span>
        </div>
        <div className={styles.autopsyInsightDivider} />
        <div className={styles.autopsyInsightItem}>
          <span className={styles.autopsyInsightNum}>312K</span>
          <span className={styles.autopsyInsightLabel}>Watch Hours</span>
          <span className={styles.autopsyInsightSub}>vs 4.1K</span>
        </div>
      </div>

      {/* CHART + CAPTION */}
      <div
        className={`${styles.autopsyChartBlock} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[3] = el; }}
        style={{ transitionDelay: "250ms" }}
      >
        <div className={styles.autopsyChartLeft}>
          <span className={styles.featureTag}>HOW IT WORKS</span>
          <h3 className={styles.autopsyChartTitle}>From Data to Decisions</h3>
          <p className={styles.autopsyChartDesc}>
            We analyze your entire content ecosystem — videos, titles, thumbnails, scripts, and audience behavior — to extract patterns that drive real growth.
          </p>
          <div className={styles.autopsySteps}>
            {["Connect", "Analyze", "Extract Patterns", "Build DNA", "Generate Strategy"].map((step, i) => (
              <div key={step} className={styles.autopsyStep}>
                <span className={styles.autopsyStepNum}>0{i + 1}</span>
                <span className={styles.autopsyStepText}>{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.autopsyChartRight}>
          <Image
            src="/alldata.png"
            alt="How CreatorDNA Works — From Data to Decisions"
            width={680}
            height={380}
            style={{ width: "100%", height: "auto", borderRadius: "16px", opacity: 0.92 }}
          />
        </div>
      </div>
    </section>
  );
}
