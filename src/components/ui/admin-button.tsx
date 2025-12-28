import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const adminButtonVariants = cva(
  "admin-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium overflow-hidden relative transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75",
        primary:
          "bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75",
        secondary:
          "bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75",
        outline:
          "bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75",
        ghost: 
          "bg-cyan-950 text-cyan-400 border border-cyan-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75",
        destructive:
          "bg-red-950 text-red-400 border border-red-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75",
        success:
          "bg-green-950 text-green-400 border border-green-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75",
        warning:
          "bg-yellow-950 text-yellow-400 border border-yellow-400 border-b-4 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-base",
        icon: "h-9 w-9",
        xs: "h-7 rounded px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof adminButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // 根据variant选择光条颜色
    const glowColor = variant === 'destructive' ? 'bg-red-400 shadow-red-400' 
      : variant === 'success' ? 'bg-green-400 shadow-green-400'
      : variant === 'warning' ? 'bg-yellow-400 shadow-yellow-400'
      : 'bg-cyan-400 shadow-cyan-400';
    
    return (
      <Comp
        className={cn(adminButtonVariants({ variant, size }), "group", className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        <span className={cn(
          glowColor,
          "absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"
        )} />
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </Comp>
    );
  },
);
AdminButton.displayName = "AdminButton";

export { AdminButton, adminButtonVariants }; 