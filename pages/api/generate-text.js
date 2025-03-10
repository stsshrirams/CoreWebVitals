export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { data } = req.body;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        let reportText = "Core Web Vitals Report\n\n";

        data.forEach(item => {
            reportText += `URL: ${item.url}\n`;
            reportText += `Strategy: ${item.strategy}\n`;
            reportText += `LCP: ${item.LCP} sec (${item.LCP < 2.5 ? "✅ Good" : item.LCP < 4.0 ? "⚠️ Needs Improvement" : "❌ Poor"})\n`;
            reportText += `FID: ${item.FID} sec (${item.FID < 100 ? "✅ Good" : item.FID < 300 ? "⚠️ Needs Improvement" : "❌ Poor"})\n`;
            reportText += `CLS: ${item.CLS} (${item.CLS < 0.1 ? "✅ Good" : item.CLS < 0.25 ? "⚠️ Needs Improvement" : "❌ Poor"})\n`;
            reportText += `INP: ${item.INP !== "N/A" ? `${item.INP} sec (${item.INP < 200 ? "✅ Good" : item.INP < 500 ? "⚠️ Needs Improvement" : "❌ Poor"})` : "N/A (N/A)"}\n`;
            reportText += `\n`;
        });

        // Convert text to Buffer
        const fileBuffer = Buffer.from(reportText, 'utf-8');

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename="core_web_vitals_report.txt"');
        res.send(fileBuffer);
    } catch (error) {
        console.error("❌ Text File Generation Error:", error);
        res.status(500).json({ message: error.message });
    }
}
