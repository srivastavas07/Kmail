import { Link } from "react-router-dom";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { buttonVariants } from "./ui/button";
import { cn } from "../lib/utils";

export function Navigation({ links, isCollapsed }) {
  return (
    <div className={`group flex flex-col gap-4 py-2 ${isCollapsed ? "py-2" : ""}`}>
      <nav className={`grid gap-1 px-2 ${isCollapsed ? "justify-center px-2" : ""}`}>
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger>
                <Link
                  to={`/${link.title}`}
                  className={cn(
                    buttonVariants({ variant: link.variant, size: "icon" }),
                    link.variant === "default" &&
                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              to={`/${link.title.toLowerCase()}`}
              className={cn(
                buttonVariants({ variant: link.variant, size: "sm" }),
                link.variant === "default" &&
                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start"
              )}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    "ml-auto",
                    link.variant === "default" &&
                    "text-background dark:text-white"
                  )}
                >
                  {link.label}
                </span>
              )}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}