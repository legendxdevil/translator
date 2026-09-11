'use client';

import { motion, Variants } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  wordDelay?: number;
}

export function BlurText({
  text,
  className = '',
  delay = 0.2,
  wordDelay = 0.09,
}: BlurTextProps) {
  const words = text.split(' ');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: wordDelay,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      filter: 'blur(16px)',
      y: 28,
      scale: 0.92,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale: 1,
      transition: {
        duration: 0.75,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className={`inline-flex flex-wrap gap-x-[0.28em] gap-y-1 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={wordVariants}
          className="inline-block transform-gpu"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
