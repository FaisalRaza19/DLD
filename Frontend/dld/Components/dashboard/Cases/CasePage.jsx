"use client"
import React, { useState, useEffect } from "react"
import { useApp } from "@/Context/Context.jsx"
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx"
import CaseForm from "./CaseForm.jsx"
import CaseSkeleton from "@/Components/Skeletons/CaseSkeleton.jsx"
import { FiPlus, FiSearch, FiEye, FiEdit, FiTrash2, FiFile, FiRefreshCw } from "react-icons/fi"
import Link from "next/link.js"

const CasePage = () => {
    const { Cases, addAlert } = useApp()
    const { cases, delCase, setCases, changeStatus } = Cases
    const [filteredCases, setFilteredCases] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [selectedCase, setSelectedCase] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [caseToDelete, setCaseToDelete] = useState(null)
    const [loading, setLoading] = useState(false)

    const [showStatusModal, setShowStatusModal] = useState(false)
    const [caseToUpdate, setCaseToUpdate] = useState(null)
    const [newStatus, setNewStatus] = useState("Open")
    const [statusNote, setStatusNote] = useState("")

    // Styles
    const layoutCard = "bg-white border border-gray-200"
    const inputClass = "bg-gray-50 border border-gray-300 text-gray-900"
    const textClass = "text-black"
    const mutedTextClass = "text-gray-500"
    const buttonPrimaryClass = "bg-black text-white hover:bg-gray-800"

    // Badge Colors
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "open": return "bg-green-100 text-green-800"
            case "in progress": return "bg-yellow-100 text-yellow-800"
            case "closed": return "bg-gray-100 text-gray-800"
            case "on hold": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const getTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case "civil": return "bg-blue-100 text-blue-800"
            case "criminal": return "bg-red-100 text-red-800"
            case "corporate": return "bg-purple-100 text-purple-800"
            case "family": return "bg-pink-100 text-pink-800"
            case "personal-injury": return "bg-orange-100 text-orange-800"
            case "real-estate": return "bg-green-100 text-green-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    // Filtering Logic
    useEffect(() => {
        let filtered = cases
        if (searchQuery) {
            filtered = filtered?.filter(
                (c) =>
                    c.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.caseDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.caseType?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        if (statusFilter !== "all") filtered = filtered?.filter(c => c.status?.toLowerCase() === statusFilter.toLowerCase())
        if (typeFilter !== "all") filtered = filtered?.filter(c => c.caseType?.toLowerCase() === typeFilter.toLowerCase())
        setFilteredCases(filtered)
    }, [cases, searchQuery, statusFilter, typeFilter])

    // del case
    const handleDeleteCase = async (caseId) => {
        try {
            setLoading(true)
            const result = await delCase({ caseId })
            if (result.statusCode === 200) {
                setCases(prev => prev.filter(c => c._id !== caseId))
                addAlert({ type: "success", message: "Case deleted successfully!" })
            }
        } catch (error) {
            addAlert({ type: "error", message: "An error occurred while deleting the case" })
        } finally {
            setLoading(false)
            setShowDeleteModal(false)
        }
    }

    // update status
    const handleUpdateStatus = async () => {
        try {
            setLoading(true)
            if (!caseToUpdate) return
            const payload = {
                caseId: caseToUpdate._id,
                newStatus,
                note: statusNote || null
            }
            const data = await changeStatus(payload)
            if (data.statusCode === 200) {
                addAlert({ type: "success", message: "Case status changed successfully!" })
                setCases(prev =>
                    prev.map(c => c._id === caseToUpdate._id ? { ...c, status: newStatus } : c)
                )
            }
        } catch (error) {
            addAlert({ type: "error", message: "Error during status update" })
        } finally {
            setLoading(false)
            setShowStatusModal(false)
            setCaseToUpdate(null)
            setStatusNote("")
        }
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={`text-3xl font-bold ${textClass}`}>Cases</h1>
                        <p className={mutedTextClass}>Manage your legal cases</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${buttonPrimaryClass}`}
                    >
                        <FiPlus className="h-4 w-4" /> Add Case
                    </button>
                </div>

                {/* Filters */}
                <div className={`${layoutCard} rounded-lg p-4 flex flex-col md:flex-row gap-4`}>
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search cases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${inputClass}`}
                        />
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className={`px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${inputClass}`}
                        >
                            <option value="all">All Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                            <option value="On Hold">On Hold</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            className={`px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${inputClass}`}
                        >
                            <option value="all">All Types</option>
                            <option value="Civil">Civil</option>
                            <option value="Criminal">Criminal</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Family">Family</option>
                            <option value="Tax">Tax</option>
                            <option value="Constitutional">Constitutional</option>
                            <option value="Property">Property</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Cases List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)]?.map((_, i) => <CaseSkeleton key={i} />)}
                    </div>
                ) : filteredCases?.length === 0 ? (
                    <div className={`${layoutCard} rounded-lg p-8 text-center`}>
                        <p className={mutedTextClass}>No cases found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCases?.map(c => (
                            <div key={c._id} className={`${layoutCard} rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center`}>
                                <div className="flex-1 mb-4 md:mb-0">
                                    <h3 className={`text-lg font-semibold mb-2 ${textClass}`}>{c.caseTitle}</h3>
                                    <p className={`${mutedTextClass} mb-3`}>{c.caseDescription}</p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(c.caseType)}`}>
                                            {c.caseType}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                                            {c.status}
                                        </span>
                                        {c.caseDocs?.length > 0 && (
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <FiFile className="h-3 w-3" /> {c.caseDocs.length} document{c.caseDocs.length > 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Link href={`/dashboard/cases/${c._id}`}>
                                        <button title="View" className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                                            <FiEye className="h-4 w-4" />
                                        </button>
                                    </Link>
                                    <button onClick={() => { setSelectedCase(c); setShowEditForm(true) }} title="Edit" className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                                        <FiEdit className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => { setCaseToUpdate(c); setNewStatus(c.status || "Open"); setShowStatusModal(true) }} title="Change Status" className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors">
                                        <FiRefreshCw className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => { setCaseToDelete(c); setShowDeleteModal(true) }} title="Delete" className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors">
                                        <FiTrash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Forms */}
                <CaseForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} />
                <CaseForm
                    isOpen={showEditForm}
                    onClose={() => { setShowEditForm(false); setSelectedCase(null) }}
                    caseData={selectedCase}
                    isEdit={true}
                />

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className={`${layoutCard} rounded-lg p-6 w-full max-w-md mx-4`}>
                            <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>Delete Case</h3>
                            <p className={`${mutedTextClass} mb-6`}>
                                Are you sure you want to delete "{caseToDelete?.caseTitle}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-4">
                                <button onClick={() => { setShowDeleteModal(false); setCaseToDelete(null) }} className="px-4 py-2 rounded-lg text-black hover:text-gray-700 transition-colors">Cancel</button>
                                <button onClick={() => handleDeleteCase(caseToDelete._id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                    {loading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Modal */}
                {showStatusModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className={`${layoutCard} rounded-lg p-6 w-full max-w-md mx-4`}>
                            <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>Update Case Status</h3>
                            <div className="space-y-4">
                                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={`w-full px-3 py-2 rounded-lg ${inputClass}`}>
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Closed">Closed</option>
                                </select>
                                <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Add a note (optional)" className={`w-full px-3 py-2 rounded-lg ${inputClass}`} rows="3" />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button onClick={() => { setShowStatusModal(false); setCaseToUpdate(null) }} className="px-4 py-2 rounded-lg text-black hover:text-gray-700 transition-colors">Cancel</button>
                                <button onClick={handleUpdateStatus} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                                    {loading ? "Updating Status..." : "Update Status"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    )
}

export default CasePage
