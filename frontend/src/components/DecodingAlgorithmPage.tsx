"use client";

import { useEffect, useRef, useState } from "react";
import { Cpu, Network, Zap, Binary, GitBranch, Database, Sparkles, Workflow } from "lucide-react";
import styles from "../app/landing.module.css";

const steps = [
  {
    icon: <Database size={24} />,
    title: "Real-time Firehose",
    description: "Ingests raw performance telemetry, metadata, and audience retention graphs across 50M+ videos daily.",
    color: "#3b82f6"
  },
  {
    icon: <Network size={24} />,
    title: "Neural Fingerprinting",
    description: "NLP models deconstruct your historical videos to map your unique hook structures, pacing, and vocabulary.",
    color: "#8b5cf6"
  },
  {
    icon: <Workflow size={24} />,
    title: "Predictive Simulation",
    description: "Simulates your unreleased ideas against shifting macro-trends to forecast view velocity and engagement.",
    color: "#f59e0b"
  },
  {
    icon: <Zap size={24} />,
    title: "Actionable Directives",
    description: "Outputs granular, high-conviction script adjustments, thumbnail concepts, and optimal posting windows.",
    color: "#10b981"
  }
];

export function DecodingAlgorithmPage() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.animateIn);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.decodingSection} ref={containerRef}>
      <div className={styles.decodingHeader}>
        <div className={styles.decodingBadge}>
          <Binary size={14} /> SYSTEM ARCHITECTURE
        </div>
        <h2 className={styles.decodingTitle}>The Intelligence Engine</h2>
        <p className={styles.decodingSubtitle}>
          Our neural architecture processes raw YouTube data to extract hidden patterns and predict your next viral hit.
        </p>
      </div>

      <div className={styles.decodingGrid}>
        {/* Visual Engine Representation */}
        <div className={styles.engineVisual}>
          <div className={styles.glassDashboard}>
            <div className={styles.dashHeader}>
              <div className={styles.dashHeaderLeft}>
                <div className={styles.dashDot}></div>
                <span>Intelligence Engine Online</span>
              </div>
              <Cpu size={16} className={styles.dashIcon} />
            </div>
            
            <div className={styles.dashBody}>
              <div className={styles.dashRow}>
                <span className={styles.dashLabel}>Parameters</span>
                <span className={styles.dashValue}>12.4 Billion</span>
              </div>
              <div className={styles.dashRow}>
                <span className={styles.dashLabel}>Latency</span>
                <span className={styles.dashValue}>14 ms</span>
              </div>
              <div className={styles.dashRow}>
                <span className={styles.dashLabel}>Throughput</span>
                <span className={styles.dashValue}>50M+ videos/day</span>
              </div>
              <div className={styles.dashRow}>
                <span className={styles.dashLabel}>Architecture</span>
                <span className={styles.dashValue}>Transformer-XL</span>
              </div>
            </div>

            <div className={styles.dashFooter}>
              <div className={styles.processingBar}>
                <div className={styles.processingFill}></div>
              </div>
              <span>Processing live stream...</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className={styles.engineSteps}>
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className={`${styles.engineStepCard} ${activeStep === idx ? styles.activeStep : ""}`}
              onMouseEnter={() => setActiveStep(idx)}
            >
              <div className={styles.stepIconBox} style={{ color: step.color, background: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                {step.icon}
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>
                  <span className={styles.stepNum}>0{idx + 1}</span> {step.title}
                </h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
