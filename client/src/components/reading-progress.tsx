import { useEffect, useState } from "react";

interface ReadingProgressProps {
  progress: number;
}

export default function ReadingProgress({ progress }: ReadingProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Reading Progress</span>
        <span className="text-sm text-muted-foreground" data-testid="text-progress-percentage">
          {Math.round(displayProgress)}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary rounded-full h-2 transition-all duration-300 ease-out"
          style={{ width: `${displayProgress}%` }}
          data-testid="progress-bar"
        />
      </div>
    </div>
  );
}
