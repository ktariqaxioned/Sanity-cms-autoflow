import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div aria-busy="true" aria-label={`Loading ${title.toLowerCase()}`}>
      <header className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Your personal workspace
        </p>
        <h1 className="mt-2.5 mb-2 text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-medium tracking-tight">
          {title}
        </h1>
        <p className="text-[13px] leading-relaxed text-[#99a1ad]">
          {description || `Getting your ${title.toLowerCase()} ready…`}
        </p>
      </header>
      <div
        className="grid grid-cols-2 gap-5 max-[440px]:grid-cols-1"
        aria-hidden="true"
      >
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[235px] rounded-[11px] border border-[#2b3039] bg-[#181b21] p-6"
          >
            <Skeleton className="mb-6 size-10 rounded-lg" />
            <Skeleton className="mb-4 h-3 w-full" />
            <Skeleton className="h-3 w-[65%]" />
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">
        Loading {title.toLowerCase()}.
      </span>
    </div>
  );
}
