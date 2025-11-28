import React from 'react';

interface RagConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  isLoading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning';
}

export const RagConfirmationModal: React.FC<RagConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = 'primary'
}) => {
  if (!isOpen) return null;

  // Warna tombol berdasarkan variant
  const getButtonColor = () => {
    switch (variant) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
      default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg w-full overflow-hidden">
        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            {/* Icon Warning/Info */}
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'}`}>
              <svg className={`h-6 w-6 ${variant === 'danger' ? 'text-red-600' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <div className="text-sm text-gray-500">
                    {description}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              confirmLabel
            )}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};