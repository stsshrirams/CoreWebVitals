import axios from 'axios';
import { useState } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_API_Key; // Replace with actual API key
const URLS = [
    'https://www.wealthrabbit.com/solutions/simple-ira-for-advisors',
    'https://www.wealthrabbit.com/about-us',
    // 'https://www.wealthrabbit.com/blog/understanding-the-calsavers-program-what-california-employers-need-to-know',
    'https://www.wealthrabbit.com/',
    'https://www.wealthrabbit.com/features',
    'https://www.wealthrabbit.com/solutions/small-business',
    // 'https://www.wealthrabbit.com/blog/how-secure-20-impacts-simple-iras-in-2025-and-how-wealthrabbit-can-help',
    'https://www.wealthrabbit.com/solutions/accounting-professionals',
    'https://www.wealthrabbit.com/contact-us',
    // 'https://www.wealthrabbit.com/cookies-policy',
    'https://www.wealthrabbit.com/blog/managing-simple-ira-is-now-effortless',
    'https://www.wealthrabbit.com/pricing',
    // 'https://www.wealthrabbit.com/security',
    'https://www.wealthrabbit.com/full-service',
    // 'https://www.wealthrabbit.com/blog/how-accountants-can-transform-their-practice-by-partnering-with-wealthrabbit',
    'https://www.wealthrabbit.com/get-free-consultation',
    'https://www.wealthrabbit.com/resources',
    // 'https://www.wealthrabbit.com/ccpa-privacy-policy',
    'https://www.wealthrabbit.com/resources/simple-ira-vs-401k',
    // 'https://www.wealthrabbit.com/blog/managing-your-simple-ira-how-to-run-employer-contributions',
    'https://www.wealthrabbit.com/privacy-policy',
    // 'https://www.wealthrabbit.com/blog/understanding-simple-ira-a-guide-for-employers-and-employees',
    'https://www.wealthrabbit.com/resources/what-is-simple-ira',
    'https://www.wealthrabbit.com/resources/401(k)-vs-sep-vs-simple-ira',
    // 'https://www.wealthrabbit.com/blog/a-simple-guide-to-employer-onboarding-with-wealthrabbit',
    // 'https://www.wealthrabbit.com/blog/a-simple-guide-to-employee-onboarding-with-wealthrabbit',
    'https://www.wealthrabbit.com/talk-to-our-experts',
    // 'https://www.wealthrabbit.com/blog/wealthrabbits-fiduciary-commitment-to-protect-your-interests-in-simple-ira-management',
    'https://www.wealthrabbit.com/resources/simple-ira-matching-rules',
    // 'https://www.wealthrabbit.com/referral/taxbandits',
    'https://www.wealthrabbit.com/demo-request',
    'https://www.wealthrabbit.com/ccpa',
    'https://www.wealthrabbit.com/resources/simple-ira-deadline'
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
            <h1  style={{ textAlign: 'center', marginBottom: '50px' }}>WealthRabbit Core Web Vitals Report</h1>
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
