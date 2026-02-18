import { motion } from 'framer-motion';
import { SPRING_BOUNCY } from '../../constants/motion';

interface FABProps {
    onClick: () => void;
    color?: 'black' | 'red';
    className?: string;
    ariaLabel?: string;
}

export default function FAB({ onClick, color = 'black', className = '', ariaLabel = 'Add' }: FABProps) {
    const bgColor = color === 'red' ? 'bg-accent-red' : 'bg-black';
    const shadowColor = color === 'red' ? 'shadow-accent-red/30' : 'shadow-black/20';

    return (
        <motion.button
            onClick={onClick}
            aria-label={ariaLabel}
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={SPRING_BOUNCY}
            className={`fixed bottom-8 right-8 ${bgColor} text-white w-16 h-16 rounded-full shadow-xl ${shadowColor} flex items-center justify-center z-40 ${className}`}
        >
            <div className="grid grid-cols-3 grid-rows-3 gap-[2px]">
                <div className="w-1 h-1 bg-white rounded-full col-start-2 row-start-1" />
                <div className="w-1 h-1 bg-white rounded-full col-start-2 row-start-2" />
                <div className="w-1 h-1 bg-white rounded-full col-start-2 row-start-3" />
                <div className="w-1 h-1 bg-white rounded-full col-start-1 row-start-2" />
                <div className="w-1 h-1 bg-white rounded-full col-start-3 row-start-2" />
            </div>
        </motion.button>
    );
}
