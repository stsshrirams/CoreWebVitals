import axios from 'axios';
import { useState } from 'react';

const API_KEY = 'AIzaSyDR89LoKuH-oSsqT-74O6pFMncbxgYVXSg'; // Replace with actual API key
const URLS = [
    'https://www.taxexemptbonds.org/',
    // 'https://www.taxexemptbonds.org/irs-8038-corner/e-file-form-8038-cp/',
    // 'https://www.taxexemptbonds.org/contact-us/',
    // 'https://www.taxexemptbonds.org/features/',
    // 'https://www.taxexemptbonds.org/blog/meet-tax-exempt-bonds-start-your-journey-to-seamless-8038-cp-filings-and-credit-claims/',
    // 'https://www.taxexemptbonds.org/irs-8038-corner/form-8038-cp-due-date-finder/',
    // 'https://www.taxexemptbonds.org/irs-8038-corner/form-8038-cp-schedule-a/',
    // 'https://www.taxexemptbonds.org/irs-8038-corner/',
    // 'https://www.taxexemptbonds.org/terms-use/',
    // 'https://www.taxexemptbonds.org/irs-8038-corner/what-is-form-8038-cp/',
    // 'https://www.taxexemptbonds.org/irs-8038-corner/form-8038-cp-instructions/',
    // 'https://www.taxexemptbonds.org/blog/',
    // 'https://www.taxexemptbonds.org/privacy-policy/',
   
];

const fetchCoreWebVitals = async (url, strategy) => {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${API_KEY}`;
    try {
        const response = await axios.get(apiUrl);
        const metrics = response.data.lighthouseResult.audits;
        return {
            url,
            strategy,
            LCP: metrics['largest-contentful-paint'].numericValue / 1000,
            FID: metrics['interactive'].numericValue / 1000,
            CLS: metrics['cumulative-layout-shift'].numericValue,
            INP: metrics['experimental-interaction-to-next-paint']?.numericValue / 1000 || 'N/A'
        };
    } catch (error) {
        console.error(`Error fetching data for ${url}:`, error.message);
        return null;
    }
};

const WebVitalsReport = () => {
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [logMessages, setLogMessages] = useState([]);

    const log = (message) => {
        setLogMessages((prev) => [...prev, message]);
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        setLogMessages(["Starting Core Web Vitals report generation..."]);
    
        const results = [];
        for (const url of URLS) {
            log(`Fetching data for: ${url} (Mobile)`);
            const mobileData = await fetchCoreWebVitals(url, 'mobile');
            if (mobileData) {
                results.push(mobileData);
                log(`✅ Mobile data fetched for: ${url}`);
            } else {
                log(`❌ Failed to fetch Mobile data for: ${url}`);
            }
    
            log(`Fetching data for: ${url} (Desktop)`);
            const desktopData = await fetchCoreWebVitals(url, 'desktop');
            if (desktopData) {
                results.push(desktopData);
                log(`✅ Desktop data fetched for: ${url}`);
            } else {
                log(`❌ Failed to fetch Desktop data for: ${url}`);
            }
        }
    
        log("Sending data to generate text file...");
    
        const response = await fetch('/api/generate-text', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: results }) 
        });
    
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
    
        // Create a download link
        const a = document.createElement('a');
        a.href = url;
        a.download = "core_web_vitals_report.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    
        log("✅ Text file downloaded successfully.");
        setLoading(false);
    };
    

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1  style={{ textAlign: 'center', marginBottom: '50px' }}>TaxExemptBonds Core Web Vitals Report</h1>
            <button onClick={handleGenerateReport} disabled={loading} style={{ padding: '10px 20px', marginRight: '10px', marginBottom: '50px' }}>
                {loading ? 'Processing...' : 'Generate Report'}
            </button>
            
            <div style={{ marginTop: '20px', textAlign: 'left', color: "#000", maxWidth: '600px', margin: '0 auto', fontFamily: 'monospace', whiteSpace: 'pre-wrap', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
                {logMessages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>

            {pdfUrl && (
                <div style={{ marginTop: '20px' }}>
                    <a href={pdfUrl} download="core_web_vitals_report.pdf">
                        <button style={{ padding: '10px 20px' }}>Download PDF</button>
                    </a>
                </div>
            )}
        </div>
    );
};

export default WebVitalsReport;
