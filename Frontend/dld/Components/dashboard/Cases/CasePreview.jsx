"use client"
import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useApp } from "@/Context/Context.jsx"
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx"
import DocumentViewer from "@/Components/dashboard/DocumentViewer.jsx"
import CaseForm from "./CaseForm.jsx"
import {
    FiArrowLeft, FiEdit, FiTrash2, FiFile, FiDownload, FiEye, FiCalendar, FiUser, FiMail,
    FiPhone, FiMapPin, FiBriefcase, FiAward,FiBell
} from "react-icons/fi"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import Link from "next/link.js"
import { formatDate } from "@/Components/formatDate.js"
import moment from "moment"

const CasePreview = () => {
    const { id } = useParams()
    const router = useRouter()
    const { Cases, addAlert, theme, Hearings } = useApp();
    const { getCase, delCase, setCases } = Cases
    const { hearings} = Hearings

    const [caseData, setCaseData] = useState(null)
    const [caseHearings, setCaseHearings] = useState([])
    const [loading, setLoading] = useState(true)
    const [showDocumentViewer, setShowDocumentViewer] = useState(false)
    const [selectedDocument, setSelectedDocument] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [isZipping, setIsZipping] = useState(false)

    // fetch case details
    const fetchCaseDetails = async () => {
        setLoading(true)
        try {
            const result = await getCase(id)
            if (result.statusCode === 200) {
                setCaseData(result.data)
            } else {
                addAlert({ type: "error", message: result.error || "Case not found" })
                setCaseData(null)
            }
        } catch (error) {
            addAlert({ type: "error", message: "An unexpected error occurred while fetching case details." })
            setCaseData(null)
        } finally {
            setLoading(false)
        }
    }

    const fetchCaseHearings = async () => {
        try {
            const filtered = hearings.filter(h => h?.caseId?._id === id)
            // sort by start date
            filtered.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
            setCaseHearings(filtered)
        } catch (error) {
            console.error("Failed to fetch hearings:")
        }
    }

    useEffect(() => {
        if (id) {
            fetchCaseDetails()
            fetchCaseHearings()
        }
    }, [id,hearings])

    // del case
    const handleDeleteCase = async (caseId) => {
        setLoading(true)
        try {
            const result = await delCase({ caseId })
            if (result.statusCode === 200) {
                setCases(prev => prev.filter(c => c._id !== caseId))
                addAlert({ type: "success", message: "Case deleted successfully!" })
                router.push("/dashboard/cases")
            } else {
                addAlert({ type: "error", message: result.error || "Failed to delete case" })
            }
        } catch (error) {
            addAlert({ type: "error", message: "An error occurred while deleting the case" })
        } finally {
            setLoading(false)
            setShowDeleteModal(false)
        }
    }

    // download single file
    const handleDownloadSingle = (docUrl, originalName) => {
        try {
            saveAs(docUrl, originalName);
        } catch (error) {
            addAlert({ type: "error", message: "Failed to download the file." });
        }
    }

    // download all
    const handleDownloadAll = async () => {
        if (!caseData?.caseDocs || caseData.caseDocs.filter(doc => doc?.isShowing).length === 0) {
            addAlert({ type: "warning", message: "No visible documents to download." })
            return
        }

        setIsZipping(true)
        addAlert({ type: 'info', message: 'Preparing files for download...' })

        try {
            const zip = new JSZip()

            const visibleDocs = caseData.caseDocs.filter(doc => doc?.isShowing)

            const downloadPromises = visibleDocs.map(doc =>
                fetch(doc.docUrl)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to fetch ${doc.originalName}`)
                        return res.blob()
                    })
                    .then(blob => {
                        zip.file(doc.originalName, blob)
                    })
            )

            await Promise.all(downloadPromises)

            const content = await zip.generateAsync({ type: "blob" })
            saveAs(content, `${caseData.caseTitle || "case"}-documents.zip`)

            addAlert({ type: "success", message: "Documents downloaded successfully!" })

        } catch (error) {
            addAlert({ type: "error", message: "Could not create zip file" })
        } finally {
            setIsZipping(false)
        }
    }

    // --- Theme classes ---
    const bg = theme === 'light' ? 'bg-gray-50' : 'bg-gray-900';
    const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-white';
    const textMuted = theme === 'light' ? 'text-gray-500' : 'text-gray-400';
    const border = theme === 'light' ? 'border-gray-200' : 'border-gray-700';
    const primaryBtn = theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white';
    const destructiveBtn = theme === 'light' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white';

    // --- Status and Type Colors (made case-insensitive) ---
    const getStatusColor = (status = "") => {
        switch (status) {
            case "Open": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "In Progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "Closed": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            case "On Hold": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        }
    }

    const getTypeColor = (type = "") => {
        switch (type.toLowerCase()) {
            case "civil": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "criminal": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            case "corporate": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            case "family": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
            case "tax": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
            case "property": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 animate-pulse">
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
                            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="space-y-6">
                            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!caseData) {
        return (
            <DashboardLayout>
                <div className={`p-6 text-center ${bg}`}>
                    <h1 className={`text-2xl font-bold mb-4 ${textPrimary}`}>Case Not Found</h1>
                    <p className={textMuted}>The case you are looking for does not exist or could not be loaded.</p>
                    <Link href={'/dashboard/cases'}>
                        <button className={`mt-6 px-4 py-2 rounded-lg transition-colors ${primaryBtn}`}>
                            Back to Cases
                        </button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className={`p-4 md:p-6 ${bg} min-h-screen`}>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className={`p-2 ${textMuted} hover:${textPrimary} hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors`}>
                            <FiArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary}`}>{caseData.caseTitle}</h1>
                            <p className={textMuted}>Case Details</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowEditForm(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <FiEdit className="h-4 w-4" />
                            Edit
                        </button>
                        <button onClick={() => setShowDeleteModal(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${destructiveBtn}`}>
                            <FiTrash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className={`${cardBg} border ${border} rounded-lg p-6`}>
                            <h2 className={`text-xl font-semibold ${textPrimary} mb-4`}>Case Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                <div>
                                    <label className={`text-sm font-medium ${textMuted}`}>Case Type</label>
                                    <div className="mt-1">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(caseData.caseType)}`}>
                                            {caseData.caseType || "N/A"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className={`text-sm font-medium ${textMuted}`}>Status</label>
                                    <div className="mt-1">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(caseData.status)}`}>
                                            {caseData.status || "N/A"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className={`text-sm font-medium ${textMuted}`}>Created Date</label>
                                    <p className={textPrimary}>{new Date(caseData.createdAt).toLocaleDateString() || "Unknown"}</p>
                                </div>
                                <div>
                                    <label className={`text-sm font-medium ${textMuted}`}>Last Updated</label>
                                    <p className={textPrimary}>{new Date(caseData.updatedAt).toLocaleDateString() || "Unknown"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className={`${cardBg} border ${border} rounded-lg p-6`}>
                            <h2 className={`text-xl font-semibold ${textPrimary} mb-4`}>Description</h2>
                            <p className={`${textMuted} leading-relaxed whitespace-pre-wrap`}>
                                {caseData.caseDescription || "No description provided."}
                            </p>
                        </div>

                        {/* status his */}
                        {caseData?.statusHistory?.length > 0 && (
                            <div className={`${cardBg} border ${border} rounded-xl p-6 shadow-sm`}>
                                <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>Status History</h2>

                                <div className="relative pl-6 border-l-2 border-gray-300 dark:border-gray-600">
                                    {caseData.statusHistory
                                        .slice() // clone array
                                        .reverse() // show newest first
                                        .map((s, idx) => (
                                            <div key={idx} className="mb-6 relative">
                                                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                                                    <div>
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                                s?.status || "Open"
                                                            )}`}
                                                        >
                                                            {s.status}
                                                        </span>
                                                        {s?.note && <p className={`mt-1 text-sm ${textMuted}`}>{s.note}</p>}
                                                    </div>
                                                    <div className="text-xs text-gray-400 md:text-right">
                                                        {s.changedAt ? formatDate(s.changedAt) : "Today"}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Hearings */}
                        <div className={`${cardBg} border ${border} rounded-lg p-6`}>
                            <h2 className={`text-xl font-semibold ${textPrimary} mb-4`}>Hearings</h2>
                            {caseHearings.length > 0 ? (
                                <div className="space-y-3">
                                    {caseHearings.map(h => (
                                        <div key={h._id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FiCalendar className={`h-5 w-5 ${textMuted}`} />
                                                <div>
                                                    <p className={`font-medium ${textPrimary}`}>{h.title}</p>
                                                    <p className={`text-sm ${textMuted}`}>
                                                        {moment(h.startsAt).format("DD MMM YYYY, hh:mm A")}
                                                    </p>
                                                    <p className={`text-xs ${textMuted}`}>Duration: {h.durationMinutes} mins</p>
                                                    {h.subHandlerName && <p className={`text-xs ${textMuted}`}>Lawyer: {h.subHandlerName}</p>}
                                                    {h.notify && <p className={`text-xs ${textMuted}`}><FiBell className="inline" /> Reminder: {h.reminderOffsetMinutes} mins before</p>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={textMuted}>No hearings scheduled.</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Client Details */}
                        {caseData.client && (
                            <div className={`${cardBg} border ${border} rounded-lg p-6`}>
                                <h2 className={`text-xl font-semibold ${textPrimary} mb-4`}>Client Details</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3"><FiUser className={`h-4 w-4 ${textMuted}`} /><span className={textPrimary}>{caseData?.client?.fullName || 'N/A'}</span></div>
                                    <div className="flex items-center gap-3"><FiMail className={`h-4 w-4 ${textMuted}`} /><span className={textPrimary}>{caseData?.client?.email || 'N/A'}</span></div>
                                    <div className="flex items-center gap-3"><FiPhone className={`h-4 w-4 ${textMuted}`} /><span className={textPrimary}>{caseData?.client?.phoneNumber || 'N/A'}</span></div>
                                    <div className="flex items-start gap-3"><FiMapPin className={`h-4 w-4 mt-1 ${textMuted}`} /><span className={textPrimary}>{caseData?.client?.address || 'N/A'}</span></div>
                                </div>
                            </div>
                        )}

                        {/* Assigned Lawyer Details */}
                        {caseData.lawyer && (
                            <div className={`${cardBg} border ${border} rounded-lg p-6`}>
                                <h2 className={`text-xl font-semibold ${textPrimary} mb-4`}>Assigned Lawyer</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3"><FiUser className={`h-4 w-4 ${textMuted}`} /><span className={textPrimary}>{caseData?.lawyer?.fullName || 'N/A'}</span></div>
                                    <div className="flex items-center gap-3"><FiMail className={`h-4 w-4 ${textMuted}`} /><span className={textPrimary}>{caseData?.lawyer?.email || 'N/A'}</span></div>
                                    <div className="flex items-center gap-3"><FiPhone className={`h-4 w-4 ${textMuted}`} /><span className={textPrimary}>{caseData?.lawyer?.phoneNumber || 'N/A'}</span></div>
                                    <div className="flex items-start gap-3"><FiMapPin className={`h-4 w-4 mt-1 ${textMuted}`} /><span className={textPrimary}>{caseData?.lawyer?.address || 'N/A'}</span></div>
                                    <div className="flex items-center gap-3"><FiBriefcase className={`h-4 w-4 ${textMuted}`} /><span className={textPrimary}>{caseData?.lawyer?.specialization || 'N/A'}</span></div>
                                    <div className="flex items-center gap-3"><FiAward className={`h-4 w-4 ${textMuted}`} /><span className={textPrimary}>{caseData?.lawyer?.experience || 'N/A'} years</span></div>
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        <div className={`${cardBg} border ${border} rounded-lg p-6`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className={`text-xl font-semibold ${textPrimary}`}>Documents</h2>
                                {caseData.caseDocs && caseData.caseDocs.length > 0 && (
                                    <button onClick={handleDownloadAll} disabled={isZipping} className={`flex items-center gap-2 px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 ${primaryBtn}`}>
                                        <FiDownload className="h-4 w-4" />
                                        {isZipping ? "Zipping..." : "All"}
                                    </button>
                                )}
                            </div>
                            {caseData.caseDocs && caseData.caseDocs.length > 0 ? (
                                <div className="space-y-3">
                                    {caseData.caseDocs.filter(doc => doc?.isShowing).map(doc => (
                                        <div key={doc.publicId} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <FiFile className={`h-5 w-5 ${textMuted} flex-shrink-0`} />
                                                <span className={`text-sm ${textPrimary} truncate`} title={doc.originalName}>{doc.originalName}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setSelectedDocument(doc); setShowDocumentViewer(true); }} className={`p-2 ${textMuted} hover:${textPrimary} rounded-full hover:bg-gray-200 dark:hover:bg-gray-600`} title="Preview"><FiEye className="h-4 w-4" /></button>
                                                <button onClick={() => handleDownloadSingle(doc.docUrl, doc.originalName)} className={`p-2 ${textMuted} hover:${textPrimary} rounded-full hover:bg-gray-200 dark:hover:bg-gray-600`} title="Download"><FiDownload className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`${textMuted} text-center py-4`}>No documents uploaded.</p>
                            )}
                        </div>
                    </div>
                </div>

                <CaseForm
                    isOpen={showEditForm}
                    onClose={() => setShowEditForm(false)}
                    caseData={caseData}
                    setCaseData={setCaseData}
                    isEdit={true}
                />

                {/* Document Viewer Modal */}
                <DocumentViewer
                    isOpen={showDocumentViewer}
                    onClose={() => { setShowDocumentViewer(false); setSelectedDocument(null); }}
                    singleDocument={selectedDocument}
                    documents={caseData.caseDocs}
                />

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className={`${cardBg} border ${border} rounded-lg p-6 w-full max-w-md`}>
                            <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Delete Case</h3>
                            <p className={`${textMuted} mb-6`}>
                                Are you sure you want to delete "{caseData.caseTitle}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-4">
                                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                                    Cancel
                                </button>
                                <button onClick={() => handleDeleteCase(caseData?._id)} className={`px-4 py-2 rounded-lg ${destructiveBtn}`}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default CasePreview
