"use client";

import { useState } from "react";

interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

export default function UploadMagazine() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles));
      setUploadProgress(0);
      setUploadedFiles([]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Append all files
      files.forEach((file) => {
        formData.append("file", file);
      });

      const res = await fetch("/api/uploadMagazine", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.uploadedFiles) {
        setUploadedFiles(data.uploadedFiles);
        setUploadProgress(100);
      }

      console.log("Upload successful:", data.message);

      // Clear selected files after successful upload
      setFiles([]);
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadedFiles([]);
    setUploadProgress(0);
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalSize = files.reduce((total, file) => total + file.size, 0);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Upload Magazine Files</h1>
        <p className="text-gray-600">
          Select multiple images or PDF files to upload
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select Files (Multiple files allowed)
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={isUploading}
          accept="image/*,.pdf"
        />
      </div>

      {files.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">Selected files ({files.length})</p>
            <p className="text-sm text-gray-600">
              Total size: {formatFileSize(totalSize)}
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-2 bg-white rounded border"
              >
                <span className="truncate flex-1">{file.name}</span>
                <span className="text-gray-500 text-xs ml-2">
                  {formatFileSize(file.size)}
                </span>
              </li>
            ))}
          </ul>

          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="px-6 py-2 bg-yellow-500 text-black rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-600 transition-colors font-medium"
        >
          {isUploading
            ? "Uploading..."
            : `Upload ${files.length} File${files.length > 1 ? "s" : ""}`}
        </button>

        {files.length > 0 && (
          <button
            onClick={clearFiles}
            disabled={isUploading}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-gray-600 transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-8 p-6 border rounded-lg bg-green-50 border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-sm">✓</span>
            </div>
            <h2 className="text-lg font-semibold text-green-800">
              Upload Successful!
            </h2>
          </div>

          <p className="text-green-700 mb-4">
            Successfully uploaded {uploadedFiles.length} file
            {uploadedFiles.length > 1 ? "s" : ""}
          </p>

          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-white rounded border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mb-1">
                    {formatFileSize(file.size)}
                  </p>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm break-all"
                  >
                    {file.url}
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(file.url)}
                    className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                  >
                    Copy URL
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                  >
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
