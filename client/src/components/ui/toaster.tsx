import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  
  // Add an event listener for custom toast dismissal
  useEffect(() => {
    const handleDismissAll = () => {
      // Dismiss all toasts
      dismiss();
    };
    
    // Listen for our custom event
    document.addEventListener('toast-dismiss-all', handleDismissAll);
    
    // Clean up
    return () => {
      document.removeEventListener('toast-dismiss-all', handleDismissAll);
    };
  }, [dismiss]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
