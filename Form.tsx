import React from 'react';
import { cn } from '@/lib/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      className={cn("space-y-6", className)}
      {...props}
    />
  )
);
Form.displayName = "Form";

interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}

const FormField = ({
  name,
  label,
  required = false,
  children,
  error,
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-medium">{title}</h3>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
);
FormSection.displayName = "FormSection";

const FormActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end space-x-4 pt-4", className)}
    {...props}
  />
));
FormActions.displayName = "FormActions";

export { Form, FormField, FormSection, FormActions };
