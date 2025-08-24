const BackupSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 bg-muted rounded"></div>
        <div className="flex-1">
          <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-muted rounded"></div>
        <div className="h-8 w-24 bg-muted rounded"></div>
      </div>
    </div>
  )
}

export default BackupSkeleton
