import { useState } from 'react';
import axios from 'axios';

export default function UploadTimetable() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    
    if (!file.name.endsWith('.xlsx')) {
      setError("Invalid file type. Please upload a .xlsx Excel file.");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(response.data.message);
      setFile(null); // Clear file after success
      
      // Reset the file input visually
      document.getElementById('file-upload').value = '';
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process the file. Check your formatting.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[32px] font-bold text-[#1f4153] mb-2 tracking-tight">Upload Data</h2>
        <p className="text-gray-500 text-[16px]">Import your draft timetable from Excel to automatically detect conflicts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Formatting Guide (Moved to be First) */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-lg bg-[#eaf1f5] flex items-center justify-center text-[#1f4153]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-[#1f4153]">Excel Formatting Guide</h3>
          </div>

          <div className="space-y-6 text-sm text-gray-600">
            <p>To ensure the conflict engine reads your data correctly, your Excel file must follow the standard KCA template structure.</p>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">1. Cohort Headers</h4>
              <p>Each group of classes must be preceded by a row containing the Cohort Name (e.g., <span className="bg-gray-100 text-gray-800 font-mono px-1.5 py-0.5 rounded text-xs">BSD FT 3.1</span>) strictly in the <strong>first column (Column A)</strong>.</p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">2. Required Column Order</h4>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full text-left bg-white">
                  <thead className="bg-[#eaf1f5]">
                    <tr>
                      <th className="px-4 py-2 font-bold text-[#1f4153] text-xs">Col</th>
                      <th className="px-4 py-2 font-bold text-[#1f4153] text-xs">Expected Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-4 py-2 font-mono text-xs">A</td><td className="px-4 py-2">Day Number (1, 2, 3...)</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-xs">B</td><td className="px-4 py-2">Day (Monday, Tuesday...)</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-xs">C</td><td className="px-4 py-2">Time Slot (08:00 AM - 11:00 AM)</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-xs">D</td><td className="px-4 py-2">Room Type (Lecture Hall, Lab...)</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-xs">E</td><td className="px-4 py-2">Venue (e.g., TC 2-3-2)</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-xs">F</td><td className="px-4 py-2">Unit Code (e.g., BIT 3202A)</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-xs">G</td><td className="px-4 py-2">Unit Name</td></tr>
                    <tr><td className="px-4 py-2 font-mono text-xs">H</td><td className="px-4 py-2">Trimester (e.g., TRI 1)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-xs text-yellow-800 font-medium">Virtual classes must have "VIRTUAL" in the Room Type or "ZOOM" in the Venue column to avoid false-positive location conflicts.</p>
            </div>

          </div>
        </div>

        {/* Upload Zone (Moved to be Second) */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center h-full">
          
          <div className="border-2 border-dashed border-[#c8dce6] hover:border-[#1f4153] transition-colors rounded-xl p-10 text-center bg-[#eaf1f5]/30">
            <svg className="w-16 h-16 text-[#5684a1] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-bold text-[#1f4153] mb-2">Select Excel File</h3>
            <p className="text-sm text-gray-500 mb-6">Only .xlsx files are supported.</p>
            
            <input 
              type="file" 
              id="file-upload" 
              accept=".xlsx" 
              onChange={handleFileChange} 
              className="hidden"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer inline-block px-6 py-2.5 bg-white border border-[#c8dce6] text-[#1f4153] font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              Browse Files
            </label>
            
            {file && (
              <div className="mt-6 p-3 bg-white border border-[#c8dce6] rounded-lg inline-flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm font-medium text-gray-700">{file.name}</span>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
               <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span className="text-sm font-medium text-red-800">{error}</span>
            </div>
          )}
          
          {message && (
            <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
               <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span className="text-sm font-medium text-green-800">{message}</span>
            </div>
          )}

          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full mt-6 py-3.5 rounded-xl font-bold text-white shadow-md transition-all ${
              !file || uploading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-[#1f4153] hover:bg-[#2c5a73]'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing File...
              </span>
            ) : 'Upload and Validate Timetable'}
          </button>

        </div>

      </div>
    </div>
  );
}