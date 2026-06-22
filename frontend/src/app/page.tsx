"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import bgImage from "../assets/hero-bg-modern.png";
import styles from "./page.module.css";
import landStyles from "./landing.module.css";
import { Search, ShieldCheck, ArrowRight, Play, Sparkles, Dna, LineChart, CheckCircle2, X, MinusCircle, Star, Target, Feather, Radar, Scan, TrendingUp, Ban, ArrowUpRight, Sun, Moon } from "lucide-react";
import { AnimatedPremiumButton } from "../components/AnimatedPremiumButton";
import { FeatureList } from "../components/FeatureList";
import { VideoAutopsyPage } from "../components/VideoAutopsyPage";
import { ComparisonPage } from "../components/ComparisonPage";
import { PlatformFlowPage } from "../components/PlatformFlowPage";
import { CreatorSignalsPage } from "../components/CreatorSignalsPage";
import { ContactPage } from "../components/ContactPage";
import { WaitlistModal } from "../components/WaitlistModal";
import { DecodingAlgorithmPage } from "../components/DecodingAlgorithmPage";
import { LiveSignups } from "../components/LiveSignups";
import { CountdownTimer } from "../components/CountdownTimer";

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isWaitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  // Fetch count on mount
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/waitlist/count`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.count === 'number') {
          setWaitlistCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* --- OPTIMIZED BACKGROUND IMAGE --- */}
      <div className={styles.bgWrapper}>
        <Image
          src={bgImage}
          alt="Creator DNA Background"
          fill
          priority
          placeholder="blur"
          className={styles.bgImage}
        />
      </div>

      {/* --- TOP NAVBAR WITH DOTTED LINE --- */}
      <header className={`${styles.navbar} ${styles.animBase} ${styles.animDown} ${styles.delay1}`}>
        <div className={styles.navLogo}>
          CR<span className={styles.cut1}>E</span>AT<span className={styles.cut2}>O</span>R DN<span className={styles.cut3}>A</span>
        </div>
        <nav className={styles.navLinks}>
          <span className={styles.navLink}>FEATURES</span>
          <span className={styles.navSeparator}>/</span>
          <span className={styles.navLink}>PRICING</span>
          <span className={styles.navSeparator}>/</span>
          <span className={styles.navLink}>INTELLIGENCE</span>
          <span className={styles.navSeparator}>/</span>
          <span className={styles.navLink}>FAQ</span>
        </nav>
        <div className={styles.navAuth}>
          <span className={styles.signInBtn}>LOG IN</span>
          <span className={styles.signUpBtn}>SIGN UP</span>
        </div>
      </header>

      <main className={styles.container}>
        <div className={`${styles.poweredByPill} ${styles.animBase} ${styles.animScale} ${styles.delay2}`}>
          <Play size={14} className={styles.iconYoutube} /> YOUTUBE <span style={{color: '#94a3b8'}}>|</span> <Sparkles size={14} className={styles.iconGemini} /> GEMINI
        </div>

        <h1 className={`${styles.headline} ${styles.animBase} ${styles.animUp} ${styles.delay3}`}>
          CR<span className={styles.cut1}>E</span>ATORS<br />
          INT<span className={styles.cut2}>E</span>LLIGENC<span className={styles.cut1}>E</span> L<span className={styles.cut3}>A</span>B
        </h1>

        <p className={`${styles.subheadline} ${styles.animBase} ${styles.animLeft} ${styles.delay4}`}>
          The complete Creators intelligence platform for Youtube creators<br />
          Decode algorithms, trace viral patterns, detect trends<br />
          and secure views in real time.
        </p>

        <div className={`${styles.animBase} ${styles.animRight} ${styles.delay5}`}>
          <AnimatedPremiumButton 
            href="#waitlist" 
            text="JOIN WAITLIST" 
            icon={<ArrowRight size={16} />}
            onClick={(e) => {
              e.preventDefault();
              setWaitlistOpen(true);
            }}
          />
        </div>

        <div className={`${styles.featuresGrid} ${styles.animBase} ${styles.animUp} ${styles.delay6}`}>
          <div className={styles.featureItem}>
            <div className={styles.featureIconWrapper}>
              <Search size={32} />
            </div>
            <div className={styles.featureText}>
              <span className={styles.featureTitle}>DECODE ALGORITHMS</span>
              <span className={styles.featureDesc}>Real-time YouTube recommendation<br/>engine decoding</span>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureIconWrapper}>
              <Dna size={32} />
            </div>
            <div className={styles.featureText}>
              <span className={styles.featureTitle}>MAP AUDIENCE DNA</span>
              <span className={styles.featureDesc}>Deep demographics and<br/>cross-channel viewing habits</span>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureIconWrapper}>
              <LineChart size={32} />
            </div>
            <div className={styles.featureText}>
              <span className={styles.featureTitle}>FORECAST RETENTION</span>
              <span className={styles.featureDesc}>Pinpoint exact audience drop-off<br/>moments before publishing</span>
            </div>
          </div>
        </div>

      </main>

      {/* --- REST OF THE LANDING PAGE --- */}
      <div className={`${landStyles.landingWrapper} ${theme === 'light' ? landStyles.lightTheme : ''}`}>
        
        {/* Theme Toggle Button Removed */}
        {/* Vertical Dotted Lines */}
        <div className={landStyles.sideLineLeft}></div>
        <div className={landStyles.sideLineRight}></div>

        {/* Section 2: Feature List — clean scroll-animated layout */}
        <section className={landStyles.emptyPremiumPage}>
          <FeatureList />
        </section>

        {/* Section 3: Video Autopsy — with real images */}
        <section className={landStyles.emptyPremiumPage}>
          <VideoAutopsyPage />
        </section>

        {/* Section 4: Competitor Comparison Table */}
        <section className={landStyles.emptyPremiumPage}>
          <ComparisonPage onWaitlistClick={() => setWaitlistOpen(true)} />
        </section>

        {/* Page 5: Platform Flow / How it Works */}
        <section className={landStyles.emptyPremiumPage}>
          <PlatformFlowPage />
        </section>

        {/* Page 6: Decoding the Algorithm */}
        <section className={landStyles.emptyPremiumPage}>
          <DecodingAlgorithmPage />
        </section>

        {/* Page 7: Contact & Footer */}
        <section className={landStyles.emptyPremiumPage}>
          <ContactPage />
        </section>

      </div>

      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={isWaitlistOpen} 
        onClose={() => setWaitlistOpen(false)} 
        count={waitlistCount}
      />

      {/* Live Recent Signups Notification */}
      <CountdownTimer />
      <LiveSignups />
    </div>
  );
}


