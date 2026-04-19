type PromptCardGridSkeletonProps = {
  count?: number;
  showAuthor?: boolean;
  gridClassName?: string;
};

export default function PromptCardGridSkeleton({
  count = 9,
  showAuthor = true,
  gridClassName = "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3",
}: PromptCardGridSkeletonProps) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="relative rounded-xl bg-white">
          <div className="shimmer aspect-3/4 w-full overflow-hidden rounded-xl" />
          <div className="px-2 py-2">
            <div className="shimmer h-8 w-4/5 rounded" />
            {showAuthor ? (
              <div className="shimmer mt-2 h-4 w-1/2 rounded" />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
