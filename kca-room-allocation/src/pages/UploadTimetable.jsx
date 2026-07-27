import { useState, useRef } from 'react';
import axios from 'axios';

export default function UploadTimetable() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const fileInputRef = useRef(null);

  const processUpload = async (file) => {
    if (!file.name.endsWith('.xlsx')) {
      setUploadMessage({ type: 'error', text: 'Strictly accepts .xlsx files only.' });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send the file to the FastAPI backend
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      const errorText = error.response?.data?.detail || 'An error occurred during upload.';
      setUploadMessage({ type: 'error', text: errorText });
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and Drop Handlers
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); };
  const handleDragOut = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  // Button Click Handler
  const handleBrowseClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUpload(e.target.files[0]);
      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = null; 
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-[32px] font-semibold text-on-surface mb-2">Upload Timetable</h2>
        <p className="text-on-surface-variant font-body-lg text-[16px]">Upload your master schedule to begin the allocation process.</p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".xlsx" 
          className="hidden" 
        />

        <div 
          className={`w-full max-w-3xl bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(15,76,129,0.05)] border-2 border-dashed p-12 md:p-20 text-center transition-all duration-300 ease-in-out relative group cursor-pointer overflow-hidden ${
            isDragActive ? 'border-primary bg-blue-50' : 'border-primary/30 hover:border-primary/50'
          } ${isUploading ? 'opacity-75 pointer-events-none' : ''}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="pointer-events-none relative z-10 flex flex-col items-center gap-6 transition-transform duration-300 group-hover:-translate-y-2">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isDragActive ? 'bg-primary/10' : 'bg-surface-container-low group-hover:bg-primary-container/10'
            }`}>
              {isUploading ? (
                <span className="material-symbols-outlined text-[40px] text-primary animate-spin">sync</span>
              ) : (
                <span className={`material-symbols-outlined text-[40px] transition-colors duration-300 ${
                  isDragActive ? 'text-secondary-container scale-110' : 'text-primary group-hover:text-secondary-container'
                }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  cloud_upload
                </span>
              )}
            </div>
            
            <div>
              <h3 className="font-title-md text-[20px] font-semibold text-on-surface mb-2">
                {isUploading ? 'Processing File...' : 'Drag and drop your file here'}
              </h3>
              <p className="font-body-sm text-[14px] text-on-surface-variant mb-6">
                {isUploading ? 'Parsing rows and updating database' : 'Or click to browse from your computer'}
              </p>
            </div>

            {!isUploading && (
              <div className="flex flex-col items-center gap-4">
                <button 
                  className="bg-primary text-on-primary font-label-md text-[14px] px-6 py-3 rounded-lg hover:shadow-[0_4px_12px_rgba(0,53,95,0.2)] hover:-translate-y-0.5 transition-all duration-200 pointer-events-auto shadow-sm"
                  onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {uploadMessage && (
          <div className={`mt-6 p-4 w-full max-w-3xl rounded-lg flex items-center gap-3 ${
            uploadMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <span className="material-symbols-outlined">
              {uploadMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="font-body-lg text-[14px] font-medium">{uploadMessage.text}</p>
          </div>
        )}
      </div>
    </>
  );
}