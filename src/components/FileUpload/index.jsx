import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resp, setResp] = useState(null);

  const backendBase = import.meta.env.VITE_REST_BASE_API;

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await axios.post(`${backendBase}/api/dummy/csv/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setResp(response.data);
    setIsUploading(false);
    setSelectedFile(null);
  };

  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2>CSV Upload</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'アップロード中...' : 'アップロードCSV'}
        </button>
      </div>
      <textarea
        rows={5}
        style={{ width: "100%" }}
        readOnly
        value={resp ? JSON.stringify(resp, null, 2) : ""}
      />
    </section>
  );
};

export default FileUpload;