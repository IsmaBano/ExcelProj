import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CloudUpload } from 'lucide-react';
import '../styles/upload.css';
import { BACKEND_URL } from '../api/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedRecordId, setUploadedRecordId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (selectedFile) => {
    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${BACKEND_URL}/api/upload`, formData, config);

      if (response.data.record && response.data.message) {
        toast.success('Excel file uploaded successfully!');
        setUploadedRecordId(response.data.record._id);
        setPreviewData({
          filename: response.data.record.filename || selectedFile.name,
          numRows: response.data.record.numRows,
          numCols: response.data.record.numCols,
          numSheets: response.data.record.numSheets,
          emptyRows: response.data.record.emptyRows,
          firstRows: response.data.record.firstRows || [],
        });
        setFile(null);
      } else {
        toast.error('Upload failed. Try again.');
        setUploadedRecordId(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred during upload');
      setUploadedRecordId(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadedRecordId(null);
    setPreviewData(null);
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">Upload File</h2>
      <div className="upload-layout">
        {/* Left Panel */}
        <div className="upload-left">
          {!uploadedRecordId ? (
            <div
              className={`upload-box ${isDragging ? 'drag-active' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                if (!uploading) setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (uploading) return; // prevent during upload

                const droppedFile = e.dataTransfer.files[0];
                if (
                  droppedFile &&
                  (droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.xlsx'))
                ) {
                  setFile(droppedFile);
                  uploadFile(droppedFile); // Upload right after drop!
                  setUploadedRecordId(null);
                  setPreviewData(null);
                } else {
                  toast.error('Only Excel files are allowed.');
                }
              }}
              onClick={() => {
                if (!uploading) document.getElementById('hidden-file-input').click();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
                  document.getElementById('hidden-file-input').click();
                }
              }}
            >
              <input
                id="hidden-file-input"
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <div className="upload-icon-text">
  <div className="upload-icon">
    <CloudUpload size={60} strokeWidth={1.5} />
  </div>
  <p>
    {isDragging ? 'Release to upload' : 'Drag & drop Excel file here'}
    <br />
    or <span className="browse-link">browse</span>
  </p>
</div>

            </div>
          ) : (
            <div className="upload-success">
              <img src="/images/exel.jpg" alt="Excel Uploaded" />
              <p>File uploaded successfully</p>
              <p className="reupload" onClick={() => window.location.reload()}>
                Upload another file
              </p>
            </div>
          )}
        </div>

        {/* Right Panel */}
<div className="upload-right">
  {!uploadedRecordId ? (
    <div className="no-preview">
      <img src="/images/file.png" alt="No Upload" />
      <p>
        Couldn’t view any uploads
        <br />
        Upload the sheet first
      </p>
    </div>
  ) : (
    <div className="file-preview">
      <h3>File preview</h3>
      <div className="file-details">
        <p>
          <strong>File Name:</strong> {previewData?.filename || 'N/A'}
        </p>
        <p>
          <strong>No of rows:</strong> {previewData?.numRows ?? '-'}
        </p>
        <p>
          <strong>No of columns:</strong> {previewData?.numCols ?? '-'}
        </p>
        <p>
          <strong>No of sheets:</strong> {previewData?.numSheets ?? '-'}
        </p>
        <p>
          <strong>Empty rows:</strong> {previewData?.emptyRows ?? '-'}
        </p>
      </div>
              {/* Table preview */}
              {previewData?.firstRows?.length > 0 && (
                <div className="table-preview">
                  <h4>First 5 Rows</h4>
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {Object.keys(previewData.firstRows[0]).map((col, index) => (
                          <th key={index}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.firstRows.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, i) => (
                            <td key={i}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                className="analyze-button"
                onClick={() => navigate(`../Analytics/${uploadedRecordId}`)}
              >
                Analyze
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
