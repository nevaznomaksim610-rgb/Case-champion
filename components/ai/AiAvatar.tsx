import { cn } from "@/lib/utils";

// Аватар AI-кофаундера — лев в очках. Используется везде вместо иконки.
export function AiAvatar({
  size = 40,
  className,
  rounded = "full",
}: {
  size?: number;
  className?: string;
  rounded?: "full" | "2xl" | "xl";
}) {
  const radius = rounded === "full" ? "rounded-full" : rounded === "xl" ? "rounded-xl" : "rounded-2xl";
  return (
    <span
      className={cn("inline-flex items-center justify-center overflow-hidden bg-primary-soft shrink-0", radius, className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ai-coach.png"
        alt="AI-кофаундер"
        width={size}
        height={size}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </span>
  );
}
