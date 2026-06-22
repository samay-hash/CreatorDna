"use client";

import { useState } from "react";
import { Mail, Send, ChevronDown, HelpCircle } from "lucide-react";
import styles from "../app/landing.module.css";

const FAQS = [
  {
    question: "How is CreatorDNA different from vidIQ or TubeBuddy?",
    answer: "Most tools show data. CreatorDNA builds a living intelligence layer around your channel—analyzing audience behavior, content patterns, creator style, topic opportunities, and future growth signals to tell you exactly what to create next."
  },
  {
    question: "Do I need a large channel to use CreatorDNA?",
    answer: "No. CreatorDNA works for both small and large creators. The more content available, the deeper the insights become."
  },
  {
    question: "Does CreatorDNA access my private YouTube data?",
    answer: "Only data you explicitly authorize through YouTube OAuth. Your data is never sold or shared."
  },
  {
    question: "Can CreatorDNA tell me why a video failed?",
    answer: "Yes. Video Autopsy analyzes hooks, topics, pacing, engagement signals, and audience response patterns through machine learning concepts."
  },
  {
    question: "What is Channel DNA?",
    answer: "Channel DNA is a unique profile of what your audience consistently responds to and what they ignore."
  },
  {
    question: "What is Creator Style DNA?",
    answer: "It learns your storytelling structure, pacing, vocabulary, tone, and content style to help generate content in your voice."
  },
  {
    question: "How many videos are required for accurate analysis?",
    answer: "CreatorDNA becomes useful after 50 videos and becomes significantly more accurate as more content is analyzed."
  },
  {
    question: "How often is my Channel DNA updated?",
    answer: "Continuously. New uploads and audience signals automatically influence your DNA profile."
  }
];

export function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={styles.insightPage} style={{ paddingBottom: '0' }}>
      <div className={styles.insightContent}>
        
        {/* FAQ Header */}
        <div className={styles.flowHeader} style={{ marginTop: '-8rem' }}>
          <span className={styles.featureTag}>FAQ</span>
          <h2 className={styles.flowTitle}>
            Frequently Asked Questions
          </h2>
          <p className={styles.flowSubtitle}>
            Everything you need to know about the product and billing.
          </p>
        </div>

        {/* FAQ Section */}
        <div className={styles.faqContainer}>
          {FAQS.map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${openFaq === index ? styles.faqOpen : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className={styles.faqQuestion}>
                <span>{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`${styles.faqIcon} ${openFaq === index ? styles.rotateIcon : ''}`} 
                />
              </div>
              <div className={styles.faqAnswerWrapper} style={{ height: openFaq === index ? 'auto' : '0px', overflow: 'hidden' }}>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form Section */}
        <div className={styles.contactSectionWrapper}>
          <div className={styles.contactSectionHeader}>
            <h3 className={styles.contactSubTitle}>Still have questions?</h3>
            <p className={styles.contactSubDesc}>Can't find the answer you're looking for? Please chat to our friendly team.</p>
          </div>

          <div className={styles.contactFormCardCentered}>
            <form className={styles.contactForm} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  <input type="text" placeholder="MrBeast" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label>Last Name</label>
                  <input type="text" placeholder="Donaldson" className={styles.formInput} />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input type="email" placeholder="jimmy@mrbeast.com" className={styles.formInput} />
              </div>

              <div className={styles.formGroup}>
                <label>How can we help?</label>
                <textarea rows={4} placeholder="Send us a message and we'll get back to you..." className={styles.formTextarea}></textarea>
              </div>

              <button type="submit" className={styles.submitBtnCentered}>
                Send Message <Send size={16} />
              </button>
            </form>
          </div>
        </div>

      </div>
      
      {/* Simple Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>CREATOR DNA</div>
          <div className={styles.footerLinks}>
            <span>Terms</span>
            <span>Privacy</span>
            <span>Cookies</span>
          </div>
        </div>
        <div className={styles.footerBottom}>
          © 2026 Creator DNA, Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
