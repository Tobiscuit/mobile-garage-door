export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div
        className="h-12 w-12 rounded-full border-4 border-brand-tint border-t-brand-red motion-safe:animate-spin"
        aria-hidden="true"
      ></div>
    </div>
  )
}
