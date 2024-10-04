import { Skeleton } from "./ui/skeleton"

export default function SkeletonCards() {
  return (
    <div className="space-y-2.5">
        <SkeletonCard/>
        <SkeletonCard/>
        <SkeletonCard/>
        <SkeletonCard/>
        <SkeletonCard/>
        <SkeletonCard/>
    </div>
  )
}
function SkeletonCard(){
    return(
    <div className="p-4 w-full bg-primary/10 rounded-lg shadow-lg space-y-4">
      {/* Title skeleton */}
      <div className="flex justify-between">
        <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 " />
        <div className="text-xs mx-2 text-muted-foreground/60 flex items-end ">Loading<div className="loader"></div></div>
        </div> 
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Subtitle skeleton */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" /> 
      
      {/* Status section skeleton */}
      <div className="flex space-x-4">
        <Skeleton className="h-6 w-16 " />
        <Skeleton className="h-6 w-32 " />
        <Skeleton className="h-6 w-16 " />
      </div>
    </div>
    );
}
