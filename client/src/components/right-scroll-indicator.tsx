import { Sparkles } from "lucide-react";

export default function RightScrollIndicator() {
  return (
    <div className="hidden xl:flex flex-col items-center fixed right-[30px] bottom-[10%] z-40 pointer-events-none">
      {/* Scroll text written vertically */}
      <span className="text-[10px] tracking-[0.4em] text-primary/60 font-display uppercase select-none [writing-mode:vertical-lr] mb-4">
        SCROLL
      </span>
      
      {/* Golden vertical line */}
      <div className="w-[1px] h-32 bg-gradient-to-b from-primary/40 via-primary/70 to-transparent relative">
        {/* Diamond ornament in the middle of line */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rotate-45 border border-primary-foreground/30 shadow-[0_0_8px_rgba(216,170,92,0.6)]" />
      </div>

      {/* Glowing magic circular seal at the bottom */}
      <div className="mt-4 relative flex items-center justify-center w-8 h-8 rounded-full border border-primary/30 bg-primary/5 animate-[spin_8s_linear_infinite] shadow-[0_0_12px_rgba(216,170,92,0.15)]">
        <div className="absolute w-5 h-5 rounded-full border border-dashed border-primary/40" />
        <Sparkles className="h-3 w-3 text-primary" />
      </div>
    </div>
  );
}
