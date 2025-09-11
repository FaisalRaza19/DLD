"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "@/Context/Context.jsx";
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx";
import DocumentViewer from "@/Components/dashboard/DocumentViewer.jsx";
import BackupSkeleton from "@/Components/Skeletons/BackupSkeleton.jsx";
import {
    FiHardDrive,
    FiRefreshCw,
    FiDownload,
    FiEye,
    FiAlertCircle,
    FiCheckCircle,
    FiSearch,
} from "react-icons/fi";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const Backup = () => {
    const { addAlert, Cases } = useApp();
    const { getCases, restoreFiles } = Cases || {};
    const [casesData, setCasesData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedMap, setSelectedMap] = useState({});
    const [search, setSearch] = useState("");

    const [showViewer, setShowViewer] = useState(false);
    const [viewerDocs, setViewerDocs] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);

    useEffect(() => {
        fetchCases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const result = await getCases?.();
            if (result?.success !== false && (Array.isArray(result?.data) || Array.isArray(result))) {
                const incoming = Array.isArray(result?.data) ? result.data : result;
                setCasesData(incoming || []);
            } else {
                addAlert({ type: "error", message: result?.error || "Failed to fetch cases" });
            }
        } catch {
            addAlert({ type: "error", message: "Failed to fetch cases" });
        } finally {
            setLoading(false);
        }
    };

    const filteredCases = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return casesData;
        return casesData.filter((c) => {
            const title = String(c?.caseTitle || "").toLowerCase();
            const clientName = String(c?.client?.name || c?.client?.fullName || "").toLowerCase();
            return (
                title.includes(q) ||
                clientName.includes(q) ||
                c?.caseDocs?.some((d) => String(d?.originalName || "").toLowerCase().includes(q))
            );
        });
    }, [casesData, search]);

    const setChecked = (caseId, publicId, checked) => {
        setSelectedMap((prev) => {
            const next = { ...(prev || {}) };
            const set = new Set(next[caseId] || []);
            if (checked) set.add(publicId);
            else set.delete(publicId);
            next[caseId] = set;
            return next;
        });
    };

    const clearCheckedForCase = (caseId) => {
        setSelectedMap((prev) => {
            const next = { ...(prev || {}) };
            delete next[caseId];
            return next;
        });
    };

    const handleRestoreAll = async (caseItem) => {
        const hiddenIds = (caseItem?.caseDocs || [])
            .filter((d) => d?.isShowing === false)
            .map((d) => d?.publicId)
            .filter(Boolean);

        if (hiddenIds.length === 0) {
            addAlert({ type: "info", message: "No hidden documents to restore." });
            return;
        }

        const res = await restoreFiles?.({ caseId: caseItem._id, publicIds: hiddenIds });
        if (res?.success === false) {
            addAlert({ type: "error", message: res?.error || "Restore failed" });
            return;
        }
        addAlert({ type: "success", message: "All hidden documents restored." });
        clearCheckedForCase(caseItem._id);
        fetchCases();
    };

    const handleRestoreSelected = async (caseItem) => {
        const selected = Array.from(selectedMap[caseItem._id] || []);
        if (selected.length === 0) {
            addAlert({ type: "info", message: "Select at least one hidden document." });
            return;
        }
        const res = await restoreFiles?.({ caseId: caseItem._id, publicIds: selected });
        if (res?.success === false) {
            addAlert({ type: "error", message: res?.error || "Restore failed" });
            return;
        }
        addAlert({ type: "success", message: "Selected documents restored." });
        clearCheckedForCase(caseItem._id);
        fetchCases();
    };

    const handleDownloadSingle = async (doc) => {
        try {
            const link = document.createElement("a");
            link.href = doc?.docUrl;
            link.download = doc?.originalName || "document";
            document.body.appendChild(link);
            link.click();
            link.remove();
            addAlert({ type: "success", message: `Started download: ${doc?.originalName || "document"}` });
        } catch {
            addAlert({ type: "error", message: "Download failed" });
        }
    };

    const handleDownloadAllZip = async (caseItem) => {
        try {
            const zip = new JSZip();
            const folder = zip.folder((caseItem?.caseTitle || "case-files").replace(/[^\w\- ]+/g, "_"));

            await Promise.all(
                (caseItem?.caseDocs || []).map(async (doc) => {
                    try {
                        const resp = await fetch(doc.docUrl);
                        const blob = await resp.blob();
                        const name = (doc?.originalName || doc?.publicId || "file").replace(/[\/\\]/g, "_");
                        folder.file(name, blob);
                    } catch (e) {
                        console.warn("Failed to fetch:", doc?.docUrl, e);
                    }
                })
            );

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${(caseItem?.caseTitle || "case")}-documents.zip`);
            addAlert({ type: "success", message: "ZIP download started." });
        } catch {
            addAlert({ type: "error", message: "Failed to build ZIP" });
        }
    };

    const openViewer = (docs, startDocPublicId) => {
        const list = docs || [];
        const startIndex = Math.max(0, list.findIndex((d) => d?.publicId === startDocPublicId));
        setViewerDocs(list);
        setViewerIndex(startIndex === -1 ? 0 : startIndex);
        setShowViewer(true);
    };

    const getFileEmoji = (mime) => {
        if (!mime) return "📁";
        if (mime.startsWith("image/")) return "🖼️";
        if (mime === "application/pdf") return "📄";
        if (mime.startsWith("video/")) return "🎞️";
        return "📁";
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen p-4 md:p-6 bg-white text-black">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-gray-100">
                            <FiHardDrive className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Case Backups</h1>
                            <p className="text-gray-600">View, preview, restore and download all case files.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 rounded-lg px-3 py-2 w-full sm:w-72 bg-white border border-gray-200">
                            <FiSearch className="text-gray-600" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search cases or files…"
                                className="w-full bg-transparent outline-none text-black placeholder-gray-400"
                            />
                        </div>
                        <button
                            onClick={fetchCases}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-black"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <BackupSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredCases?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-gray-50 border border-gray-200">
                        <FiAlertCircle className="h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-xl font-semibold">No Cases Backup Found</h3>
                        <p className="text-gray-600 mt-1">Create a case to see documents here.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredCases.map((c) => {
                            const docs = Array.isArray(c?.caseDocs) ? c.caseDocs : [];
                            const hiddenCount = docs.filter((d) => d?.isShowing === false).length;
                            const selectedCount = selectedMap[c._id]?.size || 0;

                            return (
                                <div key={c._id} className="rounded-2xl p-5 md:p-6 bg-gray-50 border border-gray-200">
                                    {/* Case Header */}
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg md:text-xl font-semibold truncate">{c?.caseTitle || "Untitled Case"}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-300">Total: {docs.length}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${hiddenCount ? "bg-red-50 text-red-700 border border-red-200" : "bg-gray-100 text-black border border-gray-300"}`}>
                                                    Hidden: {hiddenCount}
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-300">Selected: {selectedCount}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleDownloadAllZip(c)}
                                                className="px-3 md:px-4 py-2 rounded-lg inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-100 text-black"
                                                title="Download all documents as ZIP"
                                            >
                                                <FiDownload className="h-4 w-4" />
                                                <span className="hidden sm:inline">Download All (ZIP)</span>
                                                <span className="sm:hidden">ZIP</span>
                                            </button>
                                            {hiddenCount > 0 && (
                                                <>
                                                    <button
                                                        onClick={() => handleRestoreAll(c)}
                                                        className="px-3 md:px-4 py-2 rounded-lg inline-flex items-center gap-2 bg-black text-white hover:bg-gray-900"
                                                    >
                                                        <FiCheckCircle className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Restore All Hidden</span>
                                                        <span className="sm:hidden">Restore All</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRestoreSelected(c)}
                                                        className="px-3 md:px-4 py-2 rounded-lg inline-flex items-center gap-2 bg-black text-white hover:bg-gray-900 disabled:opacity-50"
                                                        disabled={selectedCount === 0}
                                                    >
                                                        <FiCheckCircle className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Restore Selected</span>
                                                        <span className="sm:hidden">Restore</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Documents Grid */}
                                    <div className="mt-4 md:mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
                                        {docs.map((doc) => {
                                            const isHidden = doc?.isShowing === false;
                                            const isSelected = Boolean(selectedMap[c._id]?.has(doc?.publicId));
                                            return (
                                                <div
                                                    key={doc?.publicId || doc?.docUrl}
                                                    className="group rounded-xl p-3 border border-gray-200 bg-white hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className="text-xl leading-none">{getFileEmoji(doc?.mimeType)}</span>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium truncate" title={doc?.originalName || "document"}>
                                                                    {doc?.originalName || "document"}
                                                                </p>
                                                                <p className="text-xs text-gray-600 truncate" title={doc?.mimeType}>
                                                                    {doc?.mimeType || "unknown"} · {doc?.fileSize ? `${Math.max(1, Math.round(doc.fileSize / 1024))} KB` : "--"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {isHidden ? (
                                                            <input
                                                                type="checkbox"
                                                                className="mt-1 h-4 w-4 accent-black"
                                                                checked={isSelected}
                                                                onChange={(e) => setChecked(c._id, doc?.publicId, e.target.checked)}
                                                                title="Select for restore"
                                                            />
                                                        ) : (
                                                            <span className="mt-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-black border border-gray-300">Visible</span>
                                                        )}
                                                    </div>

                                                    <div className="mt-3 flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => openViewer(docs, doc?.publicId)}
                                                            className="p-2 rounded-lg hover:bg-gray-100 transition text-black"
                                                            title="Preview"
                                                        >
                                                            <FiEye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadSingle(doc)}
                                                            className="p-2 rounded-lg hover:bg-gray-100 transition text-black"
                                                            title="Download"
                                                        >
                                                            <FiDownload className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Viewer */}
                <DocumentViewer
                    isOpen={showViewer}
                    onClose={() => setShowViewer(false)}
                    documents={viewerDocs}
                    startIndex={viewerIndex}
                />
            </div>
        </DashboardLayout>
    );
};

export default Backup;
