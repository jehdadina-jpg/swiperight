"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    const validTypes = ["application/pdf", "text/csv"];
    if (!validTypes.includes(file.type)) {
      setStatus("error");
      setMessage("Please upload a PDF or CSV file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setStatus("error");
      setMessage("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setStatus("idle");
    setMessage("");

    try {
      await onUpload(file);
      setStatus("success");
      setMessage("Statement uploaded successfully!");
    } catch (error) {
      setStatus("error");
      const message = error instanceof Error ? error.message : "Upload failed. Please try again.";
      setMessage(message);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive ? "border-ember bg-ember/5" : "border-ember/30 hover:border-ember/60"}
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          className="space-y-4"
        >
          <div className="inline-flex p-4 rounded-full bg-ember/10">
            <Upload className="w-8 h-8 text-ember" />
          </div>
          
          <div>
            <p className="text-lg font-semibold mb-2">
              {isDragActive ? "Drop your statement here" : "Drop your statement here"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF and CSV • Max 10MB
            </p>
          </div>
          
          {!uploading && (
            <Button type="button" className="mt-4">
              Browse Files
            </Button>
          )}
          
          {uploading && (
            <div className="flex items-center justify-center gap-2 text-ember">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-ember border-t-transparent" />
              <span>Uploading...</span>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              p-4 rounded-lg flex items-center gap-3
              ${status === "success" ? "bg-verdigris/10 border border-verdigris/20" : "bg-destructive/10 border border-destructive/20"}
            `}
          >
            {status === "success" ? (
              <CheckCircle className="w-5 h-5 text-verdigris" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive" />
            )}
            <p className={`text-sm ${status === "success" ? "text-verdigris" : "text-destructive"}`}>
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
