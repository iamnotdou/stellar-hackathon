"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

interface ResponsiveModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveModalContentProps {
  children: React.ReactNode;
  className?: string;
}

// Context for modal type
const ResponsiveModalContext = React.createContext<{
  isMobile: boolean;
}>({ isMobile: false });

export function useResponsiveModal() {
  return React.useContext(ResponsiveModalContext);
}

export function ResponsiveModal({
  open,
  onOpenChange,
  children,
  title,
  description,
  icon,
  className,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ResponsiveModalContext.Provider value={{ isMobile: true }}>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className={cn("px-4 pb-6", className)}>
            {(title || description || icon) && (
              <DrawerHeader className="text-center pb-2">
                {icon && <div className="flex justify-center mb-2">{icon}</div>}
                {title && <DrawerTitle>{title}</DrawerTitle>}
                {description && (
                  <DrawerDescription>{description}</DrawerDescription>
                )}
              </DrawerHeader>
            )}
            {children}
          </DrawerContent>
        </Drawer>
      </ResponsiveModalContext.Provider>
    );
  }

  return (
    <ResponsiveModalContext.Provider value={{ isMobile: false }}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={className}>
          {(title || description || icon) && (
            <div className="flex flex-col items-center gap-2">
              {icon}
              <DialogHeader>
                {title && (
                  <DialogTitle className="sm:text-center">{title}</DialogTitle>
                )}
                {description && (
                  <DialogDescription className="sm:text-center">
                    {description}
                  </DialogDescription>
                )}
              </DialogHeader>
            </div>
          )}
          {children}
        </DialogContent>
      </Dialog>
    </ResponsiveModalContext.Provider>
  );
}

export function ResponsiveModalHeader({
  children,
  className,
}: ResponsiveModalHeaderProps) {
  const { isMobile } = useResponsiveModal();

  if (isMobile) {
    return <DrawerHeader className={className}>{children}</DrawerHeader>;
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {children}
    </div>
  );
}

export function ResponsiveModalFooter({
  children,
  className,
}: ResponsiveModalFooterProps) {
  const { isMobile } = useResponsiveModal();

  if (isMobile) {
    return <DrawerFooter className={className}>{children}</DrawerFooter>;
  }

  return <div className={cn("flex gap-3 mt-4", className)}>{children}</div>;
}

export function ResponsiveModalContent({
  children,
  className,
}: ResponsiveModalContentProps) {
  return <div className={cn("space-y-5", className)}>{children}</div>;
}

export function ResponsiveModalClose({
  children,
  className,
  asChild,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const { isMobile } = useResponsiveModal();

  if (isMobile) {
    return (
      <DrawerClose asChild={asChild} className={className}>
        {children}
      </DrawerClose>
    );
  }

  return <div className={className}>{children}</div>;
}

export { ResponsiveModalContext };
