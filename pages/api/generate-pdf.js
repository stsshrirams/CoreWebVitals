import PDFDocument from 'pdfkit';
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
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { data } = req.body;
    if (!data || data.length === 0) {
        return res.status(400).json({ success: false, message: 'No data provided for the report.' });
    }

    try {
        const doc = new PDFDocument();
        const pdfPath = path.join(process.cwd(), 'public', 'core_web_vitals_report.pdf');
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        doc.fontSize(18).text('Core Web Vitals Report', { align: 'center' });
        doc.moveDown();

        data.forEach((entry, index) => {
            const { LCP, FID, CLS, INP } = entry;
            const status = evaluateMetrics(LCP, FID, CLS, INP);

            doc.fontSize(12).text(`URL: ${entry.url}`, { underline: true });
            doc.text(`Strategy: ${entry.strategy}`);
            doc.text(`LCP: ${LCP} sec (${status.LCP})`);
            doc.text(`FID: ${FID} sec (${status.FID})`);
            doc.text(`CLS: ${CLS} (${status.CLS})`);
            doc.text(`INP: ${INP} sec (${status.INP})`);
            doc.moveDown();
            if (index < data.length - 1) doc.moveDown();
        });

        doc.end();
        stream.on('finish', () => {
            res.status(200).json({ success: true, url: '/core_web_vitals_report.pdf' });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error generating PDF', error });
    }
}
