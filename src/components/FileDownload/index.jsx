import React, { useState } from 'react';
import axios from 'axios';

const FileDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const backendBase = import.meta.env.VITE_REST_BASE_API;

  const handleDownload = async () => {
    setIsDownloading(true);

    const response = await axios.get(`${backendBase}/api/dummy/csv/download`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    link.click();

    window.URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2>CSV Download</h2>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? 'ダウンロード中...' : 'ダウンロードCSV'}
        </button>
      </div>
    </section>
  );
};

export default FileDownload;