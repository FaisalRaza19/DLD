"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/Context/Context.jsx"
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx"
import LawyerForm from "@/Components/dashboard/Lawyers/LawyerForm.jsx"
import LawyerSkeleton from "@/Components/Skeletons/LawyerSkeleton.jsx"
import {
    FiPlus, FiSearch, FiEdit, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiAward, FiBookOpen,
} from "react-icons/fi"
import { formatDate } from "@/Components/formatDate"

const LawyerPage = () => {
    const router = useRouter()
    const { userData, addAlert, theme, Lawyers } = useApp()
    const { lawyers, setLawyers, delLawyer } = Lawyers
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

    // Theme-based class helpers
    const layoutCard = theme === "light" ? "bg-white border border-gray-200" : "bg-gray-800 border border-gray-700"
    const inputClass = theme === "light" ? "bg-gray-50 border border-gray-300 text-gray-900" : "bg-gray-900 border border-gray-700 text-gray-100"
    const textClass = theme === "light" ? "text-gray-900" : "text-gray-100"
    const mutedTextClass = theme === "light" ? "text-gray-500" : "text-gray-400"
    const buttonPrimaryClass = theme === "light" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-400"
    const hoverAccentClass = theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"
    const destructiveButtonClass = theme === "light" ? "bg-red-500 text-white hover:bg-red-600" : "bg-red-600 text-white hover:bg-red-700"


    // Check if user has access to lawyers section
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
            const result = await delLawyer({ lawyerId })
            if (result?.statusCode === 200) {
                setLawyers(prev => prev.filter(c => c._id !== lawyerId))
                addAlert({ type: "success", message: "Lawyer removed successfully!" })
            }
        } catch (error) {
            addAlert({ type: "error", message: "An error occurred while removing the lawyer" })
        } finally {
            setLoading(false)
            setShowDeleteModal(false)
            setLawyerToDelete(null)
        }
    }

    const getInitials = (name) => {
        return name
            ?.split(" ")
            ?.map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const getSpecializationColor = (specialization) => {
        switch (specialization) {
            case "corporate-law":
                return theme === "light" ? "bg-blue-100 text-blue-800" : "bg-blue-900 text-blue-200"
            case "criminal-law":
                return theme === "light" ? "bg-red-100 text-red-800" : "bg-red-900 text-red-200"
            case "family-law":
                return theme === "light" ? "bg-pink-100 text-pink-800" : "bg-pink-900 text-pink-200"
            case "personal-injury":
                return theme === "light" ? "bg-orange-100 text-orange-800" : "bg-orange-900 text-orange-200"
            case "civil-law":
                return theme === "light" ? "bg-green-100 text-green-800" : "bg-green-900 text-green-200"
            case "real-estate":
                return theme === "light" ? "bg-purple-100 text-purple-800" : "bg-purple-900 text-purple-200"
            case "intellectual-property":
                return theme === "light" ? "bg-indigo-100 text-indigo-800" : "bg-indigo-900 text-indigo-200"
            case "employment-law":
                return theme === "light" ? "bg-yellow-100 text-yellow-800" : "bg-yellow-900 text-yellow-200"
            case "tax-law":
                return theme === "light" ? "bg-teal-100 text-teal-800" : "bg-teal-900 text-teal-200"
            case "immigration-law":
                return theme === "light" ? "bg-cyan-100 text-cyan-800" : "bg-cyan-900 text-cyan-200"
            default:
                return theme === "light" ? "bg-gray-100 text-gray-800" : "bg-gray-900 text-gray-200"
        }
    }

    const formatSpecialization = (specialization) => {
        return specialization
            .split("-")
            ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }

    // Redirect if not law firm
    if (userData && userData?.role !== "Law Firm") {
        return null
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className={`text-3xl font-bold ${textClass}`}>Lawyers</h1>
                        <p className={mutedTextClass}>Manage your law firm's attorneys</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${buttonPrimaryClass}`}
                    >
                        <FiPlus className="h-4 w-4" />
                        Add Lawyer
                    </button>
                </div>

                {/* Search and Filters */}
                <div className={`${layoutCard} rounded-lg p-4 mb-6`}>
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${mutedTextClass}`} />
                            <input
                                type="text"
                                placeholder="Search lawyers by name, email, specialization, or phoneNumber..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputClass}`}
                            />
                        </div>

                        {/* Specialization Filter */}
                        <select
                            value={specializationFilter}
                            onChange={(e) => setSpecializationFilter(e.target.value)}
                            className={`px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputClass}`}
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
                </div>

                {/* Lawyers List */}

                {loadingLawyers ? (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <LawyerSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredLawyers?.length === 0 ? (
                    <div className={`${layoutCard} rounded-lg p-8 text-center`}>
                        <FiUser className={`h-12 w-12 mx-auto mb-4 ${mutedTextClass}`} />
                        <p className={mutedTextClass}>
                            {searchQuery || specializationFilter !== "all"
                                ? "No lawyers found matching your criteria"
                                : "No lawyers found"}
                        </p>
                        {!searchQuery && specializationFilter === "all" && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className={`mt-4 px-4 py-2 rounded-lg transition-colors ${buttonPrimaryClass}`}
                            >
                                Add Your First Lawyer
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLawyers?.map((lawyer) => (
                            <div key={lawyer?._id}
                                className={`${layoutCard} rounded-lg p-6 hover:shadow-lg transition-shadow`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-12 w-12 ${buttonPrimaryClass} rounded-full flex items-center justify-center font-semibold`}>
                                            {getInitials(lawyer?.fullName)}
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${textClass}`}>{lawyer.fullName}</h3>
                                            {lawyer.specialization && (
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getSpecializationColor(lawyer.specialization)}`}
                                                >
                                                    {formatSpecialization(lawyer.specialization)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => {
                                                setSelectedLawyer(lawyer)
                                                setShowEditForm(true)
                                            }}
                                            className={`p-2 ${mutedTextClass} hover:${textClass} ${hoverAccentClass} rounded-lg transition-colors`}
                                            title="Edit Lawyer"
                                        >
                                            <FiEdit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setLawyerToDelete(lawyer)
                                                setShowDeleteModal(true)
                                            }}
                                            className={`p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors`}
                                            title="Remove Lawyer"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className={`flex items-center gap-2 text-sm ${mutedTextClass}`}>
                                        <FiMail className="h-4 w-4" />
                                        <span className="truncate">{lawyer.email}</span>
                                    </div>
                                    {lawyer.phoneNumber && (
                                        <div className={`flex items-center gap-2 text-sm ${mutedTextClass}`}>
                                            <FiPhone className="h-4 w-4" />
                                            <span>{lawyer.phoneNumber}</span>
                                        </div>
                                    )}
                                    {lawyer.experience && (
                                        <div className={`flex items-center gap-2 text-sm ${mutedTextClass}`}>
                                            <FiBookOpen className="h-4 w-4" />
                                            <span>{lawyer.experience} years experience</span>
                                        </div>
                                    )}
                                    {lawyer.address && (
                                        <div className={`flex items-center gap-2 text-sm ${mutedTextClass}`}>
                                            <FiMapPin className="h-4 w-4" />
                                            <span className="truncate">{lawyer.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={`mt-4 pt-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
                                    <p className={`text-xs ${mutedTextClass}`}>Added on {formatDate(lawyer.createdAt) || "none"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Lawyer Form */}
                <LawyerForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} />

                {/* Edit Lawyer Form */}
                <LawyerForm
                    isOpen={showEditForm}
                    onClose={() => {
                        setShowEditForm(false)
                        setSelectedLawyer(null)
                    }}
                    lawyerData={selectedLawyer}
                    isEdit={true}
                />

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className={`${layoutCard} rounded-lg p-6 w-full max-w-md mx-4`}>
                            <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>Remove Lawyer</h3>
                            <p className={`${mutedTextClass} mb-6`}>
                                Are you sure you want to remove "{lawyerToDelete?.fullName}" from your law firm?
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setLawyerToDelete(null)
                                    }}
                                    className={`px-4 py-2 rounded-lg ${textClass} ${hoverAccentClass} transition-colors`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteLawyer(lawyerToDelete._id)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${destructiveButtonClass}`}
                                >
                                    Remove
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

