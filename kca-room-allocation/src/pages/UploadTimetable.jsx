import { useState, useRef } from 'react';

export default function UploadTimetable() {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      alert(`File dropped: ${droppedFile.name}`);
    }
  };

  // Button Click Handler
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      alert(`File selected: ${selectedFile.name}`);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-[32px] font-semibold text-on-surface mb-2">Upload Timetable</h2>
        <p className="text-on-surface-variant font-body-lg text-[16px]">Upload your master schedule to begin the allocation process.</p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".xlsx" 
          className="hidden" 
        />

        {/* Drag and Drop Zone - Stitch UI Restored */}
        <div 
          className={`w-full max-w-3xl bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(15,76,129,0.05)] border-2 border-dashed p-12 md:p-20 text-center transition-all duration-300 ease-in-out relative group cursor-pointer overflow-hidden ${
            isDragActive ? 'border-primary bg-blue-50' : 'border-primary/30 hover:border-primary/50'
          }`}
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
              <span className={`material-symbols-outlined text-[40px] transition-colors duration-300 ${
                isDragActive ? 'text-secondary-container scale-110' : 'text-primary group-hover:text-secondary-container'
              }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                cloud_upload
              </span>
            </div>
            
            <div>
              <h3 className="font-title-md text-[20px] font-semibold text-on-surface mb-2">Drag and drop your file here</h3>
              <p className="font-body-sm text-[14px] text-on-surface-variant mb-6">Or click to browse from your computer</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button 
                className="bg-primary text-on-primary font-label-md text-[14px] px-6 py-3 rounded-lg hover:shadow-[0_4px_12px_rgba(0,53,95,0.2)] hover:-translate-y-0.5 transition-all duration-200 pointer-events-auto shadow-sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents double-firing from the container click
                  handleBrowseClick();
                }}
              >
                Browse Files
              </button>
              <p className="font-mono-sm text-[13px] text-outline flex items-center gap-1 mt-4">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Accepts .xlsx files only
              </p>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        </div>

        {/* Recent Uploads / Status Card */}
        <div className="w-full max-w-3xl mt-stack-lg">
          <h4 className="font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider mb-4 pl-2 border-l-2 border-secondary-container font-semibold">
            Recent Activity
          </h4>
          <div className="bg-surface-container-lowest rounded-lg shadow-[0_4px_20px_rgba(15,76,129,0.05)] border border-outline-variant/10 divide-y divide-outline-variant/10 overflow-hidden">
            
            <div className="p-4 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline">description</span>
                <div>
                  <p className="font-body-sm text-[14px] font-medium text-on-surface">Fall_Semester_Draft_v2.xlsx</p>
                  <p className="font-mono-sm text-[13px] text-on-surface-variant">Yesterday, 14:30</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary-container/20 text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Draft
              </span>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline">description</span>
                <div>
                  <p className="font-body-sm text-[14px] font-medium text-on-surface">Spring_Semester_Final.xlsx</p>
                  <p className="font-mono-sm text-[13px] text-on-surface-variant">Oct 12, 09:15</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Active
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}