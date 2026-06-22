"use client"

import React from "react"
import Link from "next/link"
import { Calendar } from "lucide-react"
import styles from "./button.module.css"

interface AnimatedPremiumButtonProps {
  href: string
  text: string
  icon?: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
}

export function AnimatedPremiumButton({
  href,
  text,
  icon,
  onClick,
}: AnimatedPremiumButtonProps) {
  return (
    <div className={styles.buttonWrapper}>
      {/* Animated Glow Wrapper */}
      <div className={styles.glowWrapper}></div>

      {/* Inner Button Background */}
      <div className={styles.innerBackground}>
        <Link
          href={href}
          onClick={onClick}
          className={styles.link}
        >
          {/* Animated Icon Sliding Effect */}
          {icon && (
            <div className={styles.iconWrapper}>
              <div className={styles.iconTop}>
                {icon}
              </div>
              <div className={styles.iconBottom}>
                {icon}
              </div>
            </div>
          )}
          <span>{text}</span>
        </Link>
      </div>
    </div>
  )
}
