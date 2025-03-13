import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";

function getBase64Image(filePath) {
  try {
    const image = fs.readFileSync(path.resolve("./public", filePath));
    return `data:image/png;base64,${image.toString("base64")}`;
  } catch (error) {
    console.error("Error loading image:", error);
    return "https://via.placeholder.com/100"; // fallback jika gagal
  }
}
const logoBase64 = getBase64Image("images/logo.jpeg");

export async function POST(req) {
  try {
    const data = await req.json();
    const clientName = data.clientName || "Pelanggan";
    const invoiceNumber = data.invoiceNumber || "0001";
    const date = data.date || new Date().toISOString().split("T")[0];
    const items = data.items || [];
    const total = data.total || 0;
    const bankInfo = data.bankInfo || "Tidak ada informasi bank";
    console.log("debug items", items);

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .container { width: 80%; margin: auto; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .logo img { width: 100px; height: auto; }
            .invoice-title { text-align: right; font-size: 24px; font-weight: bold; }
            .info-table { width: 100%; margin-top: 20px; border-collapse: collapse; }
            .info-table th, .info-table td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
            .payment-info { margin-top: 20px; font-weight: bold; }
            .total-box { margin-top: 20px; background: #f4f4f4; padding: 10px; text-align: right; font-size: 18px; }
            .footer { margin-top: 40px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <img src="${logoBase64}" alt="Logo" />
              </div>
              <div class="invoice-title">
                Invoice #${invoiceNumber}
              </div>
            </div>
            <p><strong>DITAGIH KEPADA:</strong> ${clientName}</p>
            <p><strong>Tanggal:</strong> ${date}</p>
            <table class="info-table">
              <thead>
                <tr>
                  <th>Barang</th>
                  <th>Kuantitas</th>
                  <th>Harga</th>
                  <th>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name || "Item"}</td>
                    <td>${item.quantity || 1}</td>
                    <td>Rp${(
                      Number(item.price.replace(".", "")) || 0
                    ).toLocaleString("id-ID")}</td>
                    <td>Rp${(
                      (Number(item.price.replace(".", "")) || 0) *
                      (item.quantity || 1)
                    ).toLocaleString("id-ID")}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <p class="payment-info">Instruksi pembayaran:</p>
            <p>${bankInfo}</p>
            <div class="total-box">
              <p>Total: <strong>Rp${total.toLocaleString("id-ID")}</strong></p>
            </div>
            <p class="footer">Terima kasih sudah membeli kacangnya. Barakallah 😊</p>
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=invoice.pdf",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
