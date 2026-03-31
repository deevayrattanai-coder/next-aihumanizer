"use client";
import { useRef, useState } from "react";
import { Upload, FileText, X, FileType, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
}

const FileUpload = ({ onTextExtracted }: FileUploadProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const getFileIcon = (name: string) => {
    if (name.endsWith(".pdf"))
      return <FileType className="w-3.5 h-3.5 text-red-400" />;
    if (name.endsWith(".docx"))
      return <File className="w-3.5 h-3.5 text-blue-400" />;
    return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setFileName(file.name);

    try {
      if (file.name.endsWith(".txt")) {
        const text = await file.text();
        onTextExtracted(text);
      } else if (file.name.endsWith(".pdf")) {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file))
          .promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item) => item.str).join(" ") + "\n";
        }
        onTextExtracted(fullText.trim());
      } else if (file.name.endsWith(".docx")) {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        onTextExtracted(result.value);
      } else {
        toast({
          title: "Unsupported format",
          description: "Please upload a .txt, .pdf, or .docx file.",
          variant: "destructive",
        });
        setFileName(null);
      }
    } catch {
      toast({
        title: "Error reading file",
        description: "Could not extract text from the file.",
        variant: "destructive",
      });
      setFileName(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.pdf,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <AnimatePresence mode="wait">
        {fileName ? (
          <motion.div
            key="file-attached"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--glass))] border border-[hsl(var(--glass-border)/0.3)]"
          >
            {getFileIcon(fileName)}
            <span className="text-xs font-medium text-foreground truncate flex-1">
              {fileName}
            </span>
            {loading ? (
              <span className="text-[10px] text-muted-foreground animate-pulse">
                Extracting…
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400">✓</span>
            )}
            <button
              onClick={clear}
              className="p-1 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed transition-all duration-300 cursor-pointer group ${
              dragOver
                ? "border-primary/60 bg-primary/5"
                : "border-[hsl(var(--glass-border)/0.4)] hover:border-primary/40 hover:bg-[hsl(var(--glass)/0.4)]"
            }`}
          >
            <Upload
              className={`w-3.5 h-3.5 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
            />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {loading ? "Reading…" : "Upload file"}
            </span>
            <div className="flex items-center gap-1 ml-1">
              {[".txt", ".pdf", ".docx"].map((ext) => (
                <span
                  key={ext}
                  className="text-[8px] px-1 py-0.5 rounded bg-[hsl(var(--glass))] text-muted-foreground/60 font-mono"
                >
                  {ext}
                </span>
              ))}
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default FileUpload;
