"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import SaveExcelArrayToFirestore from "./SaveExcelArrayToFirestore";

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

      const limitedData = jsonData.map(
        ({
          code,
          name,
          stock,
          cost,
          value,
          mrp,
          rate,
          company,
          rec_date,
          supplier,
          suppinvo,
          suppdate,
          barcode,
        }) => ({
          code,
          name,
          stock,
          cost,
          value,
          mrp,
          rate,
          company,
          rec_date,
          supplier,
          suppinvo,
          suppdate,
          barcode : barcode ? String(barcode).replace("[M]", "").trim() : "",
          photoURL: "", 
          category: "", 
        })
      );

      setData(limitedData);
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

      <SaveExcelArrayToFirestore dataArray={data}/>
    </div>
  );
}
