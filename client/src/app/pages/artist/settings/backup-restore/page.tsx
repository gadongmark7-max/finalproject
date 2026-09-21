"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DatabaseBackup,
  Download,
  Upload,
  Loader2,
  FileJson,
  AlertTriangle,
  X,
} from "lucide-react";

import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert, confirmAlert } from "@/app/utils/alert";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useUserStore from "@/app/store/useUserStore";

const MAX_RESTORE_MB = 50;

interface LastBackupInfo {
  _id: string;
  createdAt: string;
  collections: string[];
  createdBy?: { name?: string; email?: string } | null;
}

interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Page() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { clearUser } = useUserStore();
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: lastBackup, isLoading: isLoadingLast } = useQuery({
    queryKey: ["backup-last"],
    queryFn: async (): Promise<LastBackupInfo | null> => {
      const res = await axiosInstance.get("/backup/last");
      return res.data;
    },
  });

  const { data: backups = [], isLoading: isLoadingBackups } = useQuery({
    queryKey: ["backup-list"],
    queryFn: async (): Promise<BackupFile[]> => {
      const res = await axiosInstance.get("/backup");
      return res.data;
    },
  });

  const backupMutation = useMutation({
    mutationFn: () => axiosInstance.post("/backup"),
    onSuccess: () => {
      successAlert("Backup created");
      queryClient.invalidateQueries({ queryKey: ["backup-last"] });
      queryClient.invalidateQueries({ queryKey: ["backup-list"] });
    },
    onError: () => errorAlert("Failed to create backup"),
  });

  const handleDownload = async (filename: string) => {
    setDownloadingFile(filename);
    try {
      const res = await axiosInstance.get(
        `/backup/download/${encodeURIComponent(filename)}`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(
        new Blob([res.data], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      errorAlert("Failed to download backup");
    } finally {
      setDownloadingFile(null);
    }
  };

  const restoreMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return axiosInstance.post("/backup/restore", formData);
    },
    onSuccess: (res) => {
      successAlert("Restore completed successfully");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (res.data?.sessionValid === false) {
        queryClient.clear();
        clearUser();
        localStorage.clear();
        sessionStorage.clear();
        router.push("/login");
        return;
      }
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      errorAlert(
        typeof err?.response?.data === "string"
          ? err.response.data
          : "Restore failed. Please check the backup file.",
      );
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      setFileError("Please select a .json backup file");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_RESTORE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_RESTORE_MB}MB`);
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setFileError(undefined);
    setSelectedFile(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileError(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRestoreClick = () => {
    if (!selectedFile) return;
    confirmAlert(
      "Restoring will overwrite ALL current system data with the contents of this backup file. This cannot be undone.",
      "Restore",
      () => restoreMutation.mutate(selectedFile),
    );
  };

  return (
    <div className="w-full px-4 sm:px-6 py-10 lg:py-16 min-h-dvh bg-primary">
      <div className="max-w-3xl mx-auto">
        {/* Grain Overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

        {/* Page Title */}
        <div className="flex items-center justify-between gap-2">
          <div className="border-b border-border pb-8 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                System
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Backup &amp; Restore
            </h1>
          </div>

          <BackButton />
        </div>

        <div className="space-y-5">
          {/* ── BACKUP ── */}
          <div className="bg-surface border border-border p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold flex items-center gap-2">
                <DatabaseBackup className="w-3.5 h-3.5" /> Backup
              </span>
            </div>

            <p className="text-sm text-text-muted leading-relaxed">
              Create a full snapshot of the system's data, saved as a single
              JSON file. Download a backup from the list below and keep it
              somewhere safe — anyone holding this file can see everything it
              contains.
            </p>

            <div className="text-[11px] text-text-dim">
              {isLoadingLast ? (
                "Checking last backup…"
              ) : lastBackup ? (
                <>
                  Last backup:{" "}
                  <span className="text-text-muted">
                    {new Date(lastBackup.createdAt).toLocaleString()}
                  </span>
                  {lastBackup.createdBy?.name && (
                    <>
                      {" "}
                      by{" "}
                      <span className="text-text-muted">
                        {lastBackup.createdBy.name}
                      </span>
                    </>
                  )}
                  {" · "}
                  {lastBackup.collections.length} collections
                </>
              ) : (
                "No backup has been created yet."
              )}
            </div>

            <Button
              onClick={() => backupMutation.mutate()}
              disabled={backupMutation.isPending}
              className="w-full sm:w-auto"
            >
              {backupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating
                  Backup...
                </>
              ) : (
                <>
                  <DatabaseBackup className="w-4 h-4" /> Create Backup
                </>
              )}
            </Button>

            {isLoadingBackups ? (
              <p className="text-[11px] text-text-dim">Loading backups…</p>
            ) : backups.length === 0 ? (
              <p className="text-[11px] text-text-dim">
                No backup files available.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.filename}>
                      <TableCell className="text-text max-w-[180px] truncate">
                        {backup.filename}
                      </TableCell>
                      <TableCell className="text-text-muted whitespace-nowrap">
                        {new Date(backup.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-text-muted whitespace-nowrap">
                        {formatSize(backup.size)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(backup.filename)}
                          disabled={downloadingFile === backup.filename}
                        >
                          {downloadingFile === backup.filename ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* ── RESTORE ── */}
          <div className="bg-surface border border-border p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" /> Restore
              </span>
            </div>

            <div className="flex items-start gap-2 border border-danger-border bg-danger-muted px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-danger-light flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-danger-light leading-relaxed">
                Restoring will overwrite ALL current system data with the
                contents of the selected backup file. This action cannot be
                undone.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 border border-dashed border-border text-text-muted text-xs hover:border-border-gold hover:text-gold transition-all duration-300"
              >
                <Upload size={16} /> Choose Backup File (.json)
              </button>
            ) : (
              <div className="flex items-center justify-between gap-3 px-4 py-3 border border-border bg-surface-alt">
                <div className="flex items-center gap-2 min-w-0">
                  <FileJson className="w-4 h-4 text-gold flex-shrink-0" />
                  <span className="text-sm text-text truncate">
                    {selectedFile.name}
                  </span>
                </div>
                <button
                  onClick={clearSelectedFile}
                  className="text-text-muted hover:text-danger-light flex-shrink-0"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {fileError && (
              <p className="text-[11px] text-danger-light">{fileError}</p>
            )}

            <Button
              onClick={handleRestoreClick}
              disabled={!selectedFile || restoreMutation.isPending}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              {restoreMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Restoring...
                </>
              ) : (
                "Restore From Backup"
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-border flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">
            Ink Of Baphomet Atelier
          </span>
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">
            Backup &amp; Restore
          </span>
        </div>
      </div>
    </div>
  );
}
