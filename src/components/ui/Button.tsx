import { motion, type HTMLMotionProps } from 'framer-motion';
import { SPRING_BOUNCY } from '../../constants/motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'rounded-xl font-display uppercase transition-colors flex items-center justify-center gap-2';

    const variants = {
        primary: 'bg-black text-white hover:bg-black/90 shadow-sm',
        secondary: 'bg-surface-color text-text-primary hover:bg-black/5 border border-transparent hover:border-black/5',
        danger: 'bg-accent-red/10 text-accent-red hover:bg-accent-red/20 border border-accent-red/20 shadow-sm',
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5',
    };

    const sizes = {
        sm: 'h-10 px-4 text-sm tracking-wide',
        md: 'h-12 px-6 text-lg tracking-wider',
        lg: 'h-14 px-8 text-xl tracking-wider',
        icon: 'h-10 w-10 p-0 rounded-full',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={SPRING_BOUNCY}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : children}
        </motion.button>
    );
}
