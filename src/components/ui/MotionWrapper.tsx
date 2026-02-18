import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { TRANSITION_FAST, fadeInUp } from "../../constants/motion";

interface MotionWrapperProps {
    children: ReactNode;
    className?: string;
}

export const MotionWrapper = ({ children, className }: MotionWrapperProps) => {
    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITION_FAST}
            className={className}
        >
            {children}
        </motion.div>
    );
};
