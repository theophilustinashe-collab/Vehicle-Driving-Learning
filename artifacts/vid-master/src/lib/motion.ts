/**
 * Roadify Centralized Motion System
 * Safe, immediate, and responsive animations (guarantees instant frame-1 visibility)
 */

export const transitions: Record<string, any> = {
  default: { type: "spring", stiffness: 300, damping: 30 },
  gentle: { type: "spring", stiffness: 200, damping: 25 },
  stiff: { type: "spring", stiffness: 500, damping: 30 },
  fast: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
  smooth: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  bounce: { type: "spring", stiffness: 400, damping: 10 },
  layout: { type: "spring", stiffness: 350, damping: 35 },
  slow: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  carMove: { type: "spring", stiffness: 100, damping: 20 },
};

export const variants = {
  fadeIn: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
  },
  fadeInUp: {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 1, y: 0 },
  },
  hoverLift: {
    rest: { y: 0, scale: 1 },
    hover: { y: -4, scale: 1.01, transition: { type: "spring", stiffness: 400, damping: 25 } }
  },
  microInteraction: {
    rest: { scale: 1 },
    tap: { scale: 0.98 },
    hover: { scale: 1.01 }
  },
  fadeInDown: {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 1, y: 0 },
  },
  slideInRight: {
    initial: { opacity: 1, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 1, x: 0 },
  },
  slideInLeft: {
    initial: { opacity: 1, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 1, scale: 1 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  listContainer: {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  },
  listItem: {
    hidden: { opacity: 1, y: 0 },
    show: { opacity: 1, y: 0 }
  },
  mobileMenu: {
    closed: { x: "-100%", opacity: 0 },
    open: { x: 0, opacity: 1 },
  },
  overlay: {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  }
};

export const tapScale = 0.98;
export const hoverScale = 1.01;
