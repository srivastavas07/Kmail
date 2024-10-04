import { cn } from "../../lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      className={cn("animate-pulse rounded-md bg-primary/20", className)}
      {...props} />)
  );
}

export { Skeleton }
