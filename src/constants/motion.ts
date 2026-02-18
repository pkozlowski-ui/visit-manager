import { type Variants, type Transition } from "framer-motion";

// NOTHING OS PURE DIGITAL PHYSICS
// Snappy, responsive, no "floaty" feel.

export const SPRING_SNAPPY: Transition = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 1,
};

export const SPRING_SMOOTH: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1,
};

export const SPRING_BOUNCY: Transition = {
    type: "spring",
    stiffness: 400,
    damping: 15,
    mass: 1,
};

export const TRANSITION_FAST: Transition = {
    type: "tween",
    ease: "easeOut",
    duration: 0.2,
};

// COMMON VARIANTS

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 4, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -4, filter: "blur(4px)" },
};

export const fadeSimple: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
        },
    },
};

export const listItem: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
};

export const scaleTap = { scale: 0.95 };
export const scaleHover = { scale: 1.02 };
