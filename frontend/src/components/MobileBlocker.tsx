import { MonitorSmartphone } from "lucide-react";
import styles from "./MobileBlocker.module.css";

export function MobileBlocker() {
  return (
    <div className={styles.mobileBlocker}>
      <MonitorSmartphone size={64} className={styles.icon} />
      <h1 className={styles.title}>Desktop Only</h1>
      <p className={styles.subtitle}>
        Please switch to desktop mode or open this site on your computer for a better experience.
      </p>
      <div className={styles.comingSoon}>
        Mobile responsive version coming soon!
      </div>
    </div>
  );
}
