const LawyerSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="flex justify-between items-center">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-muted rounded-full"></div>
          <div>
            <div className="h-5 bg-muted rounded w-32 mb-2"></div>
            <div className="h-4 bg-muted rounded w-24 mb-1"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
        </div>
        {/* Right side (actions) */}
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-muted rounded"></div>
          <div className="h-8 w-16 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default LawyerSkeleton
