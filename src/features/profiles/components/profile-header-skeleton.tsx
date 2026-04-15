export default function ProfileHeaderSkeleton() {
  return (
    <div className="flex justify-between gap-4 flex-col sm:flex-row">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gray-200 p-1">
          <div className="shimmer h-full w-full rounded-full" />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <div className="shimmer h-6 w-36 rounded" />
          <div className="shimmer mt-2 h-4 w-44 rounded" />
        </div>
      </div>

      <div className="shimmer h-10 w-28 rounded-xl" />
    </div>
  );
}

