const fs = require('fs');
const axios = require('axios');
const PDFDocument = require('pdfkit');

const API_KEY = 'AIzaSyDR89LoKuH-oSsqT-74O6pFMncbxgYVXSg'; // Replace with your actual API key
const URLS = [
    'https://www.wealthrabbit.com/solutions/simple-ira-for-advisors',
    'https://www.wealthrabbit.com/about-us',
    'https://www.wealthrabbit.com/blog/understanding-the-calsavers-program-what-california-employers-need-to-know',
    'https://www.wealthrabbit.com/',
    'https://www.wealthrabbit.com/features',
    'https://www.wealthrabbit.com/solutions/small-business',
    'https://www.wealthrabbit.com/blog/how-secure-20-impacts-simple-iras-in-2025-and-how-wealthrabbit-can-help',
    'https://www.wealthrabbit.com/solutions/accounting-professionals',
    'https://www.wealthrabbit.com/contact-us',
    'https://www.wealthrabbit.com/cookies-policy',
    'https://www.wealthrabbit.com/blog/managing-simple-ira-is-now-effortless',
    'https://www.wealthrabbit.com/pricing',
    'https://www.wealthrabbit.com/security',
    'https://www.wealthrabbit.com/full-service',
    'https://www.wealthrabbit.com/blog/how-accountants-can-transform-their-practice-by-partnering-with-wealthrabbit',
    'https://www.wealthrabbit.com/get-free-consultation',
    'https://www.wealthrabbit.com/resources',
    'https://www.wealthrabbit.com/ccpa-privacy-policy',
    'https://www.wealthrabbit.com/resources/simple-ira-vs-401k',
    'https://www.wealthrabbit.com/blog/managing-your-simple-ira-how-to-run-employer-contributions',
    'https://www.wealthrabbit.com/privacy-policy',
    'https://www.wealthrabbit.com/blog/understanding-simple-ira-a-guide-for-employers-and-employees',
    'https://www.wealthrabbit.com/resources/what-is-simple-ira',
    'https://www.wealthrabbit.com/resources/401(k)-vs-sep-vs-simple-ira',
    'https://www.wealthrabbit.com/blog/a-simple-guide-to-employer-onboarding-with-wealthrabbit',
    'https://www.wealthrabbit.com/blog/a-simple-guide-to-employee-onboarding-with-wealthrabbit',
    'https://www.wealthrabbit.com/talk-to-our-experts',
    'https://www.wealthrabbit.com/blog/wealthrabbits-fiduciary-commitment-to-protect-your-interests-in-simple-ira-management',
    'https://www.wealthrabbit.com/resources/simple-ira-matching-rules',
    'https://www.wealthrabbit.com/referral/taxbandits',
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
            LCP: metrics['largest-contentful-paint'].numericValue / 1000, // in seconds
            FID: metrics['interactive'].numericValue / 1000, // in seconds
            CLS: metrics['cumulative-layout-shift'].numericValue,
            INP: metrics['experimental-interaction-to-next-paint']?.numericValue / 1000 || 'N/A'
        };
    } catch (error) {
        console.error(`Error fetching data for ${url}:`, error.message);
        return null;
    }
};

const generateReport = async () => {
    const results = [];
    for (const url of URLS) {
        console.log(`Fetching Core Web Vitals for ${url}...`);
        const mobileData = await fetchCoreWebVitals(url, 'mobile');
        const desktopData = await fetchCoreWebVitals(url, 'desktop');
        if (mobileData) results.push(mobileData);
        if (desktopData) results.push(desktopData);
    }
    
    const outputJson = 'core_web_vitals_report.json';
    fs.writeFileSync(outputJson, JSON.stringify(results, null, 2));
    console.log(`Report saved to ${outputJson}`);
    
    generatePDFReport(results);
};

const generatePDFReport = (data) => {
    const doc = new PDFDocument();
    const outputPdf = 'core_web_vitals_report.pdf';
    const stream = fs.createWriteStream(outputPdf);
    doc.pipe(stream);
    
    doc.fontSize(18).text('Core Web Vitals Report', { align: 'center' });
    doc.moveDown();
    
    data.forEach((entry, index) => {
        doc.fontSize(12).text(`URL: ${entry.url}`, { underline: true });
        doc.text(`Strategy: ${entry.strategy}`);
        doc.text(`LCP: ${entry.LCP} sec`);
        doc.text(`FID: ${entry.FID} sec`);
        doc.text(`CLS: ${entry.CLS}`);
        doc.text(`INP: ${entry.INP} sec`);
        doc.moveDown();
        if (index < data.length - 1) doc.moveDown();
    });
    
    doc.end();
    console.log(`PDF Report saved to ${outputPdf}`);
};

generateReport();
