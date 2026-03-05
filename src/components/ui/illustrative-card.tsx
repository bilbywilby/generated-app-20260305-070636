import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
interface IllustrativeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export function IllustrativeCard({ children, className, ...props }: IllustrativeCardProps) {
  return (
    <Card 
      className={cn(
        "bg-card border-2 border-border rounded-4xl shadow-soft transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1 hover:border-primary/20",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}