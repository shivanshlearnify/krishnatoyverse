"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelUploader() {
  const [data, setData] = useState([]);
  const [uploaded, setUploaded] = useState(false);

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setData(jsonData);
      setUploaded(true);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="border p-2"
      />

      {uploaded && (
        <div className="mt-4">
          <h2 className="font-bold text-lg">Array of Objects:</h2>
          <pre className="bg-gray-100 p-2 rounded max-h-180 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
