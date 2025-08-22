import { ReactNode } from 'react';

interface GridContainerProps {
  children: ReactNode;
  className?: string;
  rowClassName?: string; // Add this prop
}

export function GridContainer({
  children,
  className = '',
  rowClassName = 'row loop justify-content-center' // Default
}: GridContainerProps) {
  return (
    <div className={`site-content container-fluid ${className}`}>
      <div className={rowClassName}>{children}</div>
    </div>
  );
}
