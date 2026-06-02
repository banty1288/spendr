import { motion } from "motion/react";
import { ReactNode } from "react";

interface ReelSlideProps {
  children: ReactNode;
  bgGradient: string;
  isActive?: boolean;
  imageUrl?: string;
}

export function ReelSlide({ children, bgGradient, isActive = true, imageUrl }: ReelSlideProps) {
  return (
    <div className={`w-full h-[100dvh] snap-start relative overflow-hidden flex flex-col justify-end pb-24 px-6 md:px-12 ${!imageUrl ? bgGradient : 'bg-black'}`}>
      
      {/* Background Image Layer */}
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={imageUrl} 
            alt="background" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Subtle overlay to ensure text is readable without blurring the image */}
      {imageUrl && (
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-0 pointer-events-none" />
      )}
      {!imageUrl && (
        <div className={`absolute inset-0 ${bgGradient} z-0 pointer-events-none`} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.6 }}
        className="z-10 w-full max-w-lg mx-auto"
      >
        {children}
      </motion.div>
    </div>
  );
}
