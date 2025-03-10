import fs from 'fs';
import path from 'path';

const evaluateMetrics = (LCP, FID, CLS, INP) => {
    return {
        LCP: LCP < 2.5 ? "✅ Good" : LCP < 4.0 ? "⚠️ Needs Improvement" : "❌ Poor",
        FID: FID < 100 ? "✅ Good" : FID < 300 ? "⚠️ Needs Improvement" : "❌ Poor",
        CLS: CLS < 0.1 ? "✅ Good" : CLS < 0.25 ? "⚠️ Needs Improvement" : "❌ Poor",
        INP: INP !== "N/A" ? (INP < 200 ? "✅ Good" : INP < 500 ? "⚠️ Needs Improvement" : "❌ Poor") : "N/A"
    };
};

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

        console.log("Generating Core Web Vitals report as a text file...");

        let reportText = "Core Web Vitals Report\n\n";
        reportText += "URL | Strategy | LCP | FID | CLS | INP\n";
        reportText += "---------------------------------------------------------\n";

        data.forEach(item => {
            const evaluation = evaluateMetrics(item.LCP, item.FID, item.CLS, item.INP);
            reportText += `${item.url} | ${item.strategy} | ${item.LCP} - ${evaluation.LCP} | ${item.FID} - ${evaluation.FID} | ${item.CLS} - ${evaluation.CLS} | ${item.INP} - ${evaluation.INP}\n`;
        });

        const filePath = path.join('/tmp', 'core_web_vitals_report.txt');
        fs.writeFileSync(filePath, reportText);

        console.log("✅ Text file generated successfully!");

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename="core_web_vitals_report.txt"');
        res.send(reportText);
    } catch (error) {
        console.error("❌ Text file generation error:", error);
        res.status(500).json({ message: error.message });
    }
}
