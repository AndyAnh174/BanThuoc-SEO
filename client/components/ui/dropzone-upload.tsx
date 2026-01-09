"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DropzoneUploadProps {
  onFileChange: (file: File | null) => void;
  value?: File | null;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  progress?: number;
}

export function DropzoneUpload({
  onFileChange,
  value,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    "application/pdf": [".pdf"],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  progress = 0,
}: DropzoneUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      if (value.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(value);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0].code === "file-too-large") {
          setError("File quá lớn. Vui lòng chọn file dưới 5MB.");
        } else if (rejection.errors[0].code === "file-invalid-type") {
            setError("Định dạng file không hỗ trợ.");
        } else {
          setError(rejection.errors[0].message);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setError(null);
        onFileChange(file);
      }
    },
    [onFileChange]
  );

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    setPreview(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div className="w-full space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full min-h-[160px] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden bg-green-50/30",
          isDragActive
            ? "border-green-500 bg-green-50"
            : "border-green-200 hover:border-green-400 hover:bg-green-50/50",
          error ? "border-red-500 bg-red-50" : ""
        )}
      >
        <input {...getInputProps()} />

        {value ? (
          <div className="flex flex-col items-center justify-center p-4 w-full h-full relative z-10">
            <button
              onClick={removeFile}
              type="button"
              className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors shadow-sm cursor-pointer z-50"
            >
              <X className="w-4 h-4" />
            </button>

            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-auto h-24 object-contain rounded-lg shadow-sm border border-gray-100"
              />
            ) : (
              <FileText className="w-16 h-16 text-green-600" />
            )}

            <p className="mt-2 text-sm font-medium text-gray-700 truncate max-w-[80%]">
              {value.name}
            </p>
            <p className="text-xs text-gray-500">
              {(value.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <div className="p-3 bg-white rounded-full shadow-sm mb-3">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium">
              <span className="text-green-700 font-semibold cursor-pointer hover:underline">
                Nhấn để tải lên
              </span>{" "}
              hoặc kéo thả vào đây
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Hỗ trợ: PDF, JPEG, PNG (Tối đa 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar (Visible when uploading or simulated) */}
      {progress > 0 && progress < 100 && (
           <div className="w-full space-y-1">
               <div className="flex justify-between text-xs text-gray-500">
                   <span>Đang tải lên...</span>
                   <span>{Math.round(progress)}%</span>
               </div>
               <Progress value={progress} className="h-2 bg-green-100 [&>div]:bg-green-600" />
           </div>
      )}
      
      {/* Fake validation error display */}
      {error && <p className="text-sm text-red-500 mt-1 ml-2">{error}</p>}
    </div>
  );
}
