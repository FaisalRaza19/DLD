"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/Context/Context.jsx"
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx"
import LawyerForm from "@/Components/dashboard/Lawyers/LawyerForm.jsx"
import LawyerSkeleton from "@/Components/Skeletons/LawyerSkeleton.jsx"
import {
    FiPlus, FiSearch, FiEdit, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiBookOpen,FiLoader
} from "react-icons/fi"
import { formatDate } from "@/Components/formatDate"

const LawyerPage = () => {
    const router = useRouter()
    const { userData, addAlert, Lawyers } = useApp()
    const { lawyers, setLawyers, delLawyer } = Lawyers
    const [isDeleting, setIsDeleting] = useState(false)

    const [filteredLawyers, setFilteredLawyers] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [specializationFilter, setSpecializationFilter] = useState("all")
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [selectedLawyer, setSelectedLawyer] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [lawyerToDelete, setLawyerToDelete] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingLawyers, setLoadingLawyers] = useState(true)

    // Access control
    useEffect(() => {
        if (userData && userData?.role !== "Law Firm") {
            addAlert({ type: "error", message: "Access denied. Only law firms can manage lawyers." })
            router.push("/dashboard")
        }
    }, [userData, router, addAlert])

    useEffect(() => {
        if (lawyers) {
            setLoadingLawyers(false)
        }
    }, [lawyers])


    // Filter lawyers based on search and filters
    useEffect(() => {
        let filtered = lawyers
        if (searchQuery) {
            filtered = filtered?.filter(
                (lawyer) =>
                    lawyer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lawyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lawyer.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lawyer.phoneNumber?.includes(searchQuery),
            )
        }

        if (specializationFilter !== "all") {
            filtered = filtered?.filter((lawyer) => lawyer.specialization === specializationFilter)
        }

        setFilteredLawyers(filtered)
    }, [lawyers, searchQuery, specializationFilter])

    // del lawyer
    const handleDeleteLawyer = async (lawyerId) => {
        try {
            setLoading(true)
            setIsDeleting(true)
            const result = await delLawyer({ lawyerId })
            if (result?.statusCode === 200) {
                setLawyers(prev => prev.filter(c => c._id !== lawyerId))
                addAlert({ type: "success", message: "Lawyer removed successfully!" })
            }
        } catch (error) {
            addAlert({ type: "error", message: "An error occurred while removing the lawyer" })
        } finally {
            setIsDeleting(false)
            setLoading(false)
            setShowDeleteModal(false)
            setLawyerToDelete(null)
        }
    }

    const getInitials = (name) => {
        return name?.split(" ")?.map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const getSpecializationColor = (specialization) => {
        switch (specialization) {
            case "corporate-law": return "bg-black/10 text-black"
            case "criminal-law": return "bg-black/10 text-black"
            case "family-law": return "bg-black/10 text-black"
            case "personal-injury": return "bg-black/10 text-black"
            case "civil-law": return "bg-black/10 text-black"
            case "real-estate": return "bg-black/10 text-black"
            case "intellectual-property": return "bg-black/10 text-black"
            case "employment-law": return "bg-black/10 text-black"
            case "tax-law": return "bg-black/10 text-black"
            case "immigration-law": return "bg-black/10 text-black"
            default: return "bg-black/10 text-black"
        }
    }

    const formatSpecialization = (specialization) => {
        return specialization.split("-")?.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    }

    // Redirect if not law firm
    if (userData && userData?.role !== "Law Firm") {
        return null
    }

    return (
        <DashboardLayout>
            <div className="p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-black">Lawyers</h1>
                        <p className="text-gray-600">Manage your law firm's attorneys</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
                    >
                        <FiPlus className="h-4 w-4" />
                        Add Lawyer
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, specialization, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                        />
                    </div>
                    <select
                        value={specializationFilter}
                        onChange={(e) => setSpecializationFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                    >
                        <option value="all">All Specializations</option>
                        <option value="civil-law">Civil Law</option>
                        <option value="criminal-law">Criminal Law</option>
                        <option value="corporate-law">Corporate Law</option>
                        <option value="family-law">Family Law</option>
                        <option value="personal-injury">Personal Injury</option>
                        <option value="real-estate">Real Estate Law</option>
                        <option value="intellectual-property">Intellectual Property</option>
                        <option value="employment-law">Employment Law</option>
                        <option value="tax-law">Tax Law</option>
                        <option value="immigration-law">Immigration Law</option>
                    </select>
                </div>

                {/* Lawyer List */}
                {loadingLawyers ? (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => <LawyerSkeleton key={i} />)}
                    </div>
                ) : filteredLawyers?.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                        <FiUser className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">
                            {searchQuery || specializationFilter !== "all"
                                ? "No lawyers found matching your criteria"
                                : "No lawyers found"}
                        </p>
                        {!searchQuery && specializationFilter === "all" && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="mt-4 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
                            >
                                Add Your First Lawyer
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLawyers.map((lawyer) => (
                            <div key={lawyer._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                                            {getInitials(lawyer.fullName)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-black">{lawyer.fullName}</h3>
                                            {lawyer.specialization && (
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getSpecializationColor(lawyer.specialization)}`}>
                                                    {formatSpecialization(lawyer.specialization)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { setSelectedLawyer(lawyer); setShowEditForm(true) }}
                                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Edit Lawyer"
                                        >
                                            <FiEdit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => { setLawyerToDelete(lawyer); setShowDeleteModal(true) }}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Remove Lawyer"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-500"><FiMail className="h-4 w-4" /><span className="truncate">{lawyer.email}</span></div>
                                    {lawyer.phoneNumber && <div className="flex items-center gap-2 text-sm text-gray-500"><FiPhone className="h-4 w-4" /><span>{lawyer.phoneNumber}</span></div>}
                                    {lawyer.experience && <div className="flex items-center gap-2 text-sm text-gray-500"><FiBookOpen className="h-4 w-4" /><span>{lawyer.experience} years experience</span></div>}
                                    {lawyer.address && <div className="flex items-center gap-2 text-sm text-gray-500"><FiMapPin className="h-4 w-4" /><span className="truncate">{lawyer.address}</span></div>}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">Added on {formatDate(lawyer.createdAt) || "none"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Forms */}
                <LawyerForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} />
                <LawyerForm
                    isOpen={showEditForm}
                    onClose={() => { setShowEditForm(false); setSelectedLawyer(null) }}
                    lawyerData={selectedLawyer}
                    isEdit={true}
                />

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4 text-black">Remove Lawyer</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to remove "{lawyerToDelete?.fullName}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-4">
                                <button onClick={() => { setShowDeleteModal(false); setLawyerToDelete(null) }}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-black hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => handleDeleteLawyer(lawyerToDelete._id)}
                                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
                                    {isDeleting ? <FiLoader className="h-4 w-4 animate-spin inline-block" /> : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default LawyerPage
