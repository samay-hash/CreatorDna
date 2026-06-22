"use client";
import { useEffect, useRef, useState } from "react";
import styles from "../app/landing.module.css";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How is CreatorDNA different from vidIQ or TubeBuddy?",
    a: "Most tools show data. CreatorDNA builds a living intelligence layer around your channel—analyzing audience behavior, content patterns, creator style, topic opportunities, and future growth signals to tell you exactly what to create next."
  },
  {
    q: "Do I need a large channel to use CreatorDNA?",
    a: "No. CreatorDNA works for both small and large creators. The more content available, the deeper the insights become."
  },
  {
    q: "Does CreatorDNA access my private YouTube data?",
    a: "Only data you explicitly authorize through YouTube OAuth. Your data is never sold or shared."
  },
  {
    q: "Can CreatorDNA tell me why a video failed?",
    a: "Yes. Video Autopsy analyzes hooks, topics, pacing, engagement signals, and audience response patterns through machine learning concepts."
  },
  {
    q: "What is Channel DNA?",
    a: "Channel DNA is a unique profile of what your audience consistently responds to and what they ignore."
  },
  {
    q: "What is Creator Style DNA?",
    a: "It learns your storytelling structure, pacing, vocabulary, tone, and content style to help generate content in your voice."
  },
  {
    q: "How many videos are required for accurate analysis?",
    a: "CreatorDNA becomes useful after 50 videos and becomes significantly more accurate as more content is analyzed."
  },
  {
    q: "How often is my Channel DNA updated?",
    a: "Continuously. New uploads and audience signals automatically influence your DNA profile."
  }
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`${styles.faqItem} ${open ? styles.faqItemOpen : ""}`}
      onClick={() => setOpen(!open)}
    >
      <div className={styles.faqQ}>
        <span>{q}</span>
        {open ? <Minus size={16} className={styles.faqIcon} /> : <Plus size={16} className={styles.faqIcon} />}
      </div>
      {open && <div className={styles.faqA}>{a}</div>}
    </div>
  );
}

export function FaqPage() {
  const elemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add(styles.rowVisible)),
      { threshold: 0.08 }
    );
    elemRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className={styles.faqPage}>

      {/* HEADER */}
      <div
        className={`${styles.faqHeader} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[0] = el; }}
      >
        <span className={styles.featureTag}>FAQ</span>
        <h2 className={styles.faqTitle}>
          Questions?{" "}
          <span className={styles.featurePageAccent}>We&apos;ve got answers.</span>
        </h2>
      </div>

      {/* FAQ LIST */}
      <div
        className={`${styles.faqList} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[1] = el; }}
        style={{ transitionDelay: "80ms" }}
      >
        {faqs.map((f, i) => (
          <FAQItem key={i} q={f.q} a={f.a} />
        ))}
      </div>

      {/* FINAL CTA */}
      <div
        className={`${styles.finalCta} ${styles.featureRow}`}
        ref={(el) => { elemRefs.current[2] = el; }}
        style={{ transitionDelay: "160ms" }}
      >
        <div className={styles.finalCtaInner}>
          <h2 className={styles.finalCtaTitle}>
            Stop Guessing.<br />
            <span className={styles.featurePageAccent}>Start Growing.</span>
          </h2>
          <p className={styles.finalCtaSub}>
            Join the waitlist and be the first to experience the future of creator intelligence.
          </p>
          <button className={styles.finalCtaBtn}>Join the Waitlist →</button>
          <span className={styles.finalCtaMeta}>Limited early access</span>
        </div>
      </div>

    </section>
  );
}
