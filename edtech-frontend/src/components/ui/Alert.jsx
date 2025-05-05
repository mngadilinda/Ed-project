import { cn } from '../../lib/utils';
import { ExclamationTriangleIcon, CheckCircledIcon, InfoCircledIcon } from '@radix-ui/react-icons';

const Alert = ({ className, variant = 'default', title, message, ...props }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const icons = {
    destructive: <ExclamationTriangleIcon className="h-4 w-4" />,
    success: <CheckCircledIcon className="h-4 w-4" />,
    warning: <ExclamationTriangleIcon className="h-4 w-4" />,
    info: <InfoCircledIcon className="h-4 w-4" />,
    default: null,
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start">
        {icons[variant] && (
          <span className="mr-2 mt-0.5 flex-shrink-0">
            {icons[variant]}
          </span>
        )}
        <div className="flex-1">
          {title && (
            <h3 className="mb-1 text-sm font-medium">
              {title}
            </h3>
          )}
          {message && (
            <div className="text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Alert };