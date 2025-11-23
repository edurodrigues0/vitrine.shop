"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(
  undefined,
);

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Popover({ open: controlledOpen, onOpenChange, children }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const handleOpenChange = onOpenChange ?? setInternalOpen;

  const contextValue = React.useMemo(
    () => ({ open, onOpenChange: handleOpenChange }),
    [open, handleOpenChange],
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  );
}

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within Popover");
  }
  return context;
}

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

function PopoverTrigger({
  asChild,
  children,
  className,
  ...props
}: PopoverTriggerProps & React.ComponentProps<"button">) {
  const { open, onOpenChange } = usePopoverContext();

  const handleClick = () => {
    onOpenChange(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      onClick: handleClick,
      className: cn(className, (children as React.ReactElement<any>).props.className),
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}

function PopoverContent({
  children,
  className,
  align = "start",
  ...props
}: PopoverContentProps) {
  const { open } = usePopoverContext();
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
  } | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentHeight = contentRef.current?.offsetHeight || 0;
      const contentWidth = contentRef.current?.offsetWidth || 300;

      let left = triggerRect.left;
      if (align === "center") {
        left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
      } else if (align === "end") {
        left = triggerRect.left + triggerRect.width - contentWidth;
      }

      setPosition({
        top: triggerRect.bottom + 8,
        left,
      });
    } else {
      setPosition(null);
    }
  }, [open, align]);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        const { onOpenChange } = usePopoverContext();
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!open || !position) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg",
        className,
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        backgroundColor: 'hsl(var(--popover))',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Atualizar PopoverTrigger para capturar a referência
const PopoverTriggerWithRef = React.forwardRef<
  HTMLButtonElement,
  PopoverTriggerProps & React.ComponentProps<"button">
>(({ asChild, children, className, ...props }, ref) => {
  const { open, onOpenChange } = usePopoverContext();
  const internalRef = React.useRef<HTMLElement | null>(null);

  React.useImperativeHandle(ref, () => internalRef.current as HTMLButtonElement);

  const handleClick = () => {
    onOpenChange(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      ref: (node: HTMLElement) => {
        internalRef.current = node;
        if (typeof ref === "function") ref(node as HTMLButtonElement);
        else if (ref) ref.current = node as HTMLButtonElement;
      },
      onClick: handleClick,
      className: cn(className, (children as React.ReactElement<any>).props.className),
    });
  }

  return (
    <button
      type="button"
      ref={ref}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});

PopoverTriggerWithRef.displayName = "PopoverTrigger";

export {
  Popover,
  PopoverTriggerWithRef as PopoverTrigger,
  PopoverContent,
};



