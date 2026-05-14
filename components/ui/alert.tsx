import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-card border-border text-foreground",
        info: "border-primary/30 bg-primary/5 text-foreground",
        accent: "border-accent/30 bg-accent/5 text-foreground",
        destructive: "border-destructive/30 bg-destructive/5 text-destructive",
        success: "border-success/30 bg-success/10 text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  ),
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm leading-relaxed [&_p]:leading-relaxed text-muted-foreground", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
