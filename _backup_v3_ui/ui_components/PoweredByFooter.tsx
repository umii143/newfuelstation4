import React from 'react';

interface PoweredByFooterProps {
    className?: string;
}

export const PoweredByFooter: React.FC<PoweredByFooterProps> = ({ className = '' }) => {
    const whatsappNumber = '923168432329';
    const whatsappLink = `https://wa.me/${whatsappNumber}`;

    return (
        <div className={`text-center py-2 border-t border-gray-200 ${className}`}>
            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
            >
                Powered by <span className="font-bold">Umar Ali</span>
            </a>
        </div>
    );
};

// Also export from here for convenience
export default PoweredByFooter;
