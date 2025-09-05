export default function LoadingSpinner({ size = "md", color = "emerald" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const colorClasses = {
    emerald: "border-emerald-600",
    blue: "border-blue-600",
    gray: "border-gray-600"
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-b-2 border-t-2 ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ className = "", lines = 3 }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded mb-2 ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function LoadingCard({ className = "" }) {
  return (
    <div className={`animate-pulse border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="h-4 bg-gray-200 rounded mb-2 w-1/4" />
      <div className="h-6 bg-gray-200 rounded mb-2 w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
    </div>
  );
}