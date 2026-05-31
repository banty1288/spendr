import { motion } from "motion/react";
import { ReactNode } from "react";

interface ReelSlideProps {
  children: ReactNode;
  bgGradient: string;
  isActive?: boolean;
}

export function ReelSlide({ children, bgGradient, isActive = true }: ReelSlideProps) {
  return (
    <div className={`w-full h-[100dvh] snap-start relative overflow-hidden flex flex-col justify-center px-6 md:px-12 ${bgGradient}`}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.6 }}
        className="z-10 w-full max-w-lg mx-auto"
      >
        {children}
      </motion.div>
      
      {/* Subtle overlay to ensure text is readable */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-0 pointer-events-none" />
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-0 pointer-events-none" />
    </div>
  );
}
