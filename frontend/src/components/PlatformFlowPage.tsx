"use client";
import { useEffect, useRef } from "react";
import styles from "../app/landing.module.css";
import { Play, TrendingUp, Sparkles } from "lucide-react";

export function PlatformFlowPage() {
  const elemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blurLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    // Observer for main section fade-ins
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.rowVisible);
          }
        });
      },
      { threshold: 0.1 }
    );
    elemRefs.current.forEach((el) => el && observer.observe(el));

    // Observer for staggered blur-line reveal
    const blurObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.blurLineVisible);
            blurObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    blurLineRefs.current.forEach((el) => el && blurObserver.observe(el));

    return () => {
      observer.disconnect();
      blurObserver.disconnect();
    };
  }, []);

  return (
    <section className={styles.platformPage}>

      {/* =========================================
          SECTION 1: THE 5-STEP FLOW
          ========================================= */}
      <div className={`${styles.flowHeader} ${styles.animateFadeInUp}`} ref={(el) => { elemRefs.current[0] = el; }}>
        <span className={styles.featureTag}>HOW CREATORDNA WORKS</span>
        <h2 className={styles.flowTitle}>
          Decoding The <span className={styles.hoverCurve}>Algorithm</span>
        </h2>
        <p className={styles.flowSubtitle}>
          Most creator tools show you numbers.<br />
          CreatorDNA turns <span className={styles.featurePageAccent}>data into decisions.</span>
        </p>
      </div>

      <div className={`${styles.flowStepsWrapper} ${styles.animateFadeInUp}`} ref={(el) => { elemRefs.current[1] = el; }} style={{ transitionDelay: "100ms" }}>
        {/* Step 1 */}
        <div className={styles.flowStepCard}>
          <div className={styles.flowStepNum}>1</div>
          <h3 className={styles.flowStepTitle}>Connect Channel</h3>
          <p className={styles.flowStepDesc}>Import your complete YouTube history in seconds.</p>
        </div>

        {/* Step 2 */}
        <div className={styles.flowStepCard}>
          <div className={styles.flowStepNum}>2</div>
          <h3 className={styles.flowStepTitle}>Analyze Every Signal</h3>
          <p className={styles.flowStepDesc}>We analyze 1000+ signals across your videos.</p>
        </div>

        {/* Step 3 */}
        <div className={styles.flowStepCard}>
          <div className={styles.flowStepNum}>3</div>
          <h3 className={styles.flowStepTitle}>Build Your Channel DNA</h3>
          <p className={styles.flowStepDesc}>We build your unique DNA based on what your audience loves and ignores.</p>
        </div>

        {/* Step 4 */}
        <div className={styles.flowStepCard}>
          <div className={styles.flowStepNum}>4</div>
          <h3 className={styles.flowStepTitle}>Pattern Discovery Engine</h3>
          <p className={styles.flowStepDesc}>Our AI finds hidden patterns that drive views, watch time and engagement.</p>
        </div>

        {/* Step 5 */}
        <div className={styles.flowStepCard}>
          <div className={styles.flowStepNum}>5</div>
          <h3 className={styles.flowStepTitle}>AI Strategy Layer</h3>
          <p className={styles.flowStepDesc}>Get personalized recommendations on what to create next.</p>
        </div>
      </div>

    </section>
  );
}
