const CaseSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-muted rounded"></div>
          <div className="h-8 w-16 bg-muted rounded"></div>
          <div className="h-8 w-16 bg-muted rounded"></div>
        </div>
      </div>
      <div className="h-4 bg-muted rounded w-full mb-2"></div>
      <div className="h-4 bg-muted rounded w-2/3"></div>
    </div>
  )
}

export default CaseSkeleton
