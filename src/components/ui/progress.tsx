import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const clampProgressValue = (input: number | undefined): number => {
  if (typeof input !== "number" || !Number.isFinite(input)) {
    return 50;
  }

  return Math.min(100, Math.max(0, input));
};

const interpolateHue = (value: number): number => {
  // 0 → 0° (red), 100 → 220° (blue-leaning indigo) for an intuitive cold/hot blend.
  return Math.round((value / 100) * 220);
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const clampedValue = clampProgressValue(value);
  const hue = interpolateHue(clampedValue);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={clampedValue}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - clampedValue}%)`,
          backgroundColor: `hsl(${hue} 85% 55%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
