import React from 'react';

const DownloadPDFButton = () => {
    const handleDownload = () => {
        window.open('/api/core-web-vitals?format=pdf', '_blank');
    };

    return (
        <button 
            onClick={handleDownload} 
            style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}
        >
            Download PDF Report
        </button>
    );
};

export default DownloadPDFButton;
