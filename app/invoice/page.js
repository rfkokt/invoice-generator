"use client";

import { useState } from "react";

export default function InvoicePage() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([{ name: "", quantity: 1, price: "" }]);
  const [bankInfo, setBankInfo] = useState(
    "Bank DKI Novia Trie Rizkiyanti : 60123192832"
  );

  const addItem = () =>
    setItems([...items, { name: "", quantity: 1, price: "" }]);

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const generatePDF = async () => {
    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const response = await fetch("/api/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName, date, items, total, bankInfo }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoice.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-md text-gray-900">
      <h1 className="text-2xl font-bold text-center mb-4">Generate Invoice</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Invoice Number
        </label>
        <input
          className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring focus:ring-blue-300 focus:outline-none"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Client Name
        </label>
        <input
          className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring focus:ring-blue-300 focus:outline-none"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring focus:ring-blue-300 focus:outline-none"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <h3 className="text-lg font-semibold mb-2">Items</h3>
      {items.map((item, index) => (
        <div key={index} className="mb-2 flex gap-2">
          <input
            placeholder="Item Name"
            className="flex-1 p-2 border border-gray-300 rounded focus:ring focus:ring-blue-300 focus:outline-none"
            value={item.name}
            onChange={(e) => handleChange(index, "name", e.target.value)}
          />
          <input
            type="number"
            placeholder="Qty"
            className="w-20 p-2 border border-gray-300 rounded focus:ring focus:ring-blue-300 focus:outline-none"
            value={item.quantity}
            onChange={(e) => handleChange(index, "quantity", e.target.value)}
          />
          <input
            type="number"
            placeholder="Price"
            className="w-32 p-2 border border-gray-300 rounded focus:ring focus:ring-blue-300 focus:outline-none"
            value={item.price}
            onChange={(e) => handleChange(index, "price", e.target.value)}
          />
        </div>
      ))}
      <button
        className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={addItem}
      >
        + Add Item
      </button>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Bank Info
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring focus:ring-blue-300 focus:outline-none"
          value={bankInfo}
          onChange={(e) => setBankInfo(e.target.value)}
        />
      </div>
      <button
        className="mt-4 p-3 w-full bg-green-500 text-white rounded text-lg hover:bg-green-600"
        onClick={generatePDF}
      >
        Download PDF
      </button>
    </div>
  );
}
