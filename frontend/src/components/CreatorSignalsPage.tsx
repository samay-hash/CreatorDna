"use client";
import { useEffect, useRef } from "react";
import { ArrowRight, X, Check, Video, Brain, Dna, Search, Rocket, Bot } from "lucide-react";
import styles from "../app/landing.module.css";

const SIGNAL_TAGS = [
  { label: "Topics",      top: "8%",  left: "58%" },
  { label: "Hooks",       top: "20%", left: "28%" },
  { label: "Retention",   top: "20%", left: "74%" },
  { label: "Storytelling",top: "38%", left: "14%" },
  { label: "Audience",    top: "38%", left: "80%" },
  { label: "Emotion",     top: "56%", left: "22%" },
  { label: "Format",      top: "56%", left: "74%" },
  { label: "Watch Time",  top: "72%", left: "28%" },
  { label: "Timing",      top: "72%", left: "68%" },
  { label: "CTR",         top: "84%", left: "48%" },
];

const STACK_ITEMS = [
  { icon: <Video size={22} />,   title: "YouTube Data",     desc: "We collect millions of data points from YouTube." },
  { icon: <Brain size={22} />,   title: "Pattern Engine",   desc: "Our AI analyzes and finds hidden patterns others miss." },
  { icon: <Dna size={22} />,     title: "Channel DNA",      desc: "We build your unique DNA based on your audience." },
  { icon: <Search size={22} />,  title: "Video Autopsy",    desc: "We analyze every video and decode what worked." },
  { icon: <Rocket size={22} />,  title: "Next Move Engine", desc: "We suggest what to create next to grow faster." },
  { icon: <Bot size={22} />,     title: "AI Strategist",    desc: "Personalized AI strategist for your channel growth." },
];

const ROADMAP_ITEMS = [
  { num: "01", title: "Creator Clone",             desc: "Clone top creators and reverse engineer their success." },
  { num: "02", title: "AI Script Writer",           desc: "Generate high-converting scripts in seconds." },
  { num: "03", title: "Trend Radar",                desc: "Real-time trend detection before it goes viral." },
  { num: "04", title: "Audience Simulation",        desc: "Simulate audience reactions before you upload." },
  { num: "05", title: "Viral Opportunity Engine",   desc: "Find viral content opportunities tailored for your channel." },
  { num: "06", title: "Cross-Platform Intelligence",desc: "Understand what works across YouTube, TikTok, Instagram." },
];

export function CreatorSignalsPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const fadeRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.rowVisible);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    fadeRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fade = (i: number) => (el: HTMLElement | null) => {
    fadeRefs.current[i] = el;
  };

  return (
    <section className={styles.csPage}>

      {/* ── HERO ─────────────────────────────────── */}
      <div className={styles.csHero}>
        <div className={styles.csHeroLeft}>
          <span
            className={`${styles.featureTag} ${styles.animateFadeInUp}`}
            ref={fade(0) as React.Ref<HTMLSpanElement>}
          >
            THE CREATOR INTELLIGENCE ENGINE
          </span>
          <h2
            className={`${styles.csHeroTitle} ${styles.animateFadeInUp}`}
            ref={fade(1) as React.Ref<HTMLHeadingElement>}
            style={{ transitionDelay: "100ms" }}
          >
            Built On Millions<br />
            Of <span className={styles.featurePageAccent}>Creator Signals</span>
          </h2>
          <p
            className={`${styles.csHeroDesc} ${styles.animateFadeInUp}`}
            ref={fade(2) as React.Ref<HTMLParagraphElement>}
            style={{ transitionDelay: "200ms" }}
          >
            CreatorDNA continuously learns from content patterns,
            audience behavior, performance trends, and engagement
            signals to uncover what actually drives growth.
          </p>
          <a
            href="#waitlist"
            className={`${styles.csHeroBtn} ${styles.animateFadeInUp}`}
            ref={fade(3) as React.Ref<HTMLAnchorElement>}
            style={{ transitionDelay: "300ms" }}
          >
            Analyze My Channel <ArrowRight size={16} />
          </a>
        </div>

        {/* Orb */}
        <div
          className={`${styles.csOrbWrap} ${styles.animateFadeInUp}`}
          ref={fade(4) as React.Ref<HTMLDivElement>}
          style={{ transitionDelay: "200ms" }}
        >
          <div className={styles.csOrb}>
            <div className={styles.csOrbRing1} />
            <div className={styles.csOrbRing2} />
            <div className={styles.csOrbCore}>
              <span className={styles.csOrbSymbol}>∞</span>
            </div>
          </div>
          {SIGNAL_TAGS.map((tag) => (
            <span
              key={tag.label}
              className={styles.csSignalTag}
              style={{ top: tag.top, left: tag.left }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ────────────────────────────── */}
      <div
        className={`${styles.csStatsBar} ${styles.animateFadeInUp}`}
        ref={fade(5) as React.Ref<HTMLDivElement>}
      >
        {[
          { val: "1000+", label: "Signals Analyzed" },
          { val: "50M+",  label: "Data Points Processed" },
          { val: "24/7",  label: "Pattern Detection" },
          { val: "∞",     label: "Unique Creator Combinations" },
        ].map((s) => (
          <div key={s.label} className={styles.csStatItem}>
            <span className={styles.csStatVal}>{s.val}</span>
            <span className={styles.csStatLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── CLARITY SECTION ──────────────────────── */}
      <div
        className={`${styles.csClarityWrap} ${styles.animateFadeInUp}`}
        ref={fade(6) as React.Ref<HTMLDivElement>}
      >
        <span className={styles.featureTag}>WHAT CREATORS ACTUALLY WANT</span>
        <h2 className={styles.csClarityTitle}>
          Creators Don't Need More Data.<br />
          <span className={styles.featurePageAccent}>They Need Clarity.</span>
        </h2>
        <div className={styles.csClarityCards}>
          {/* Bad side */}
          <div className={`${styles.csClarityCard} ${styles.csClarityBad}`}>
            <div className={styles.csClarityBadge} data-bad>
              <X size={18} strokeWidth={3} />
            </div>
            <ul className={styles.csClarityList}>
              {["More Analytics","More Dashboards","More Numbers","More Charts"].map((t) => (
                <li key={t} className={styles.csClarityItemBad}>
                  <X size={14} strokeWidth={2.5} /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Arrow */}
          <div className={styles.csClarityArrow}>
            <ArrowRight size={32} />
          </div>

          {/* Good side */}
          <div className={`${styles.csClarityCard} ${styles.csClarityGood}`}>
            <div className={styles.csClarityBadge} data-good>
              <Check size={18} strokeWidth={3} />
            </div>
            <ul className={styles.csClarityList}>
              {["What To Upload","Why Videos Fail","What Audience Wants","What To Do Next"].map((t) => (
                <li key={t} className={styles.csClarityItemGood}>
                  <Check size={14} strokeWidth={2.5} /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── INTELLIGENCE STACK ───────────────────── */}
      <div
        className={`${styles.csStackWrap} ${styles.animateFadeInUp}`}
        ref={fade(7) as React.Ref<HTMLDivElement>}
      >
        <span className={styles.featureTag}>OUR INTELLIGENCE STACK</span>
        <h2 className={styles.csStackTitle}>Creator Intelligence Stack</h2>
        <div className={styles.csStackFlow}>
          {STACK_ITEMS.map((item, i) => (
            <div key={item.title} className={styles.csStackItemWrap}>
              <div className={styles.csStackCard}>
                <div className={styles.csStackIcon}>{item.icon}</div>
                <h4 className={styles.csStackCardTitle}>{item.title}</h4>
                <p className={styles.csStackCardDesc}>{item.desc}</p>
              </div>
              {i < STACK_ITEMS.length - 1 && (
                <div className={styles.csStackArrow}><ArrowRight size={18} /></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── ROADMAP ──────────────────────────────── */}
      <div
        className={`${styles.csRoadmapWrap} ${styles.animateFadeInUp}`}
        ref={fade(8) as React.Ref<HTMLDivElement>}
      >
        <span className={styles.featureTag}>THE FUTURE OF CREATOR INTELLIGENCE</span>
        <h2 className={styles.csRoadmapTitle}>Our Roadmap</h2>
        <p className={styles.csRoadmapSub}>
          <span className={styles.featurePageAccent}>Coming Soon</span>
        </p>
        <div className={styles.csRoadmapGrid}>
          {ROADMAP_ITEMS.map((item) => (
            <div key={item.num} className={styles.csRoadmapCard}>
              <span className={styles.csRoadmapNum}>{item.num}</span>
              <h4 className={styles.csRoadmapCardTitle}>{item.title}</h4>
              <p className={styles.csRoadmapCardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────── */}
      <div
        className={`${styles.csCtaWrap} ${styles.animateFadeInUp}`}
        ref={fade(9) as React.Ref<HTMLDivElement>}
      >
        <div className={styles.csCtaGlow} />
        <h2 className={styles.csCtaTitle}>
          Stop Guessing.<br />
          <span className={styles.featurePageAccent}>Start Growing.</span>
        </h2>
        <a href="#waitlist" className={styles.csCtaBtn}>
          Analyze My Channel <ArrowRight size={16} />
        </a>
      </div>

    </section>
  );
}
