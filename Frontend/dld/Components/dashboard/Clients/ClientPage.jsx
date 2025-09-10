"use client"
import React, { useState, useEffect } from "react"
import { useApp } from "@/Context/Context.jsx"
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx"
import ClientForm from "./ClientForm.jsx"
import ClientSkeleton from "@/Components/Skeletons/ClientSkeleton.jsx"
import { formatDate } from "@/Components/formatDate.js"
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiLoader } from "react-icons/fi"

const ClientPage = () => {
    const { addAlert, theme, Clients } = useApp()
    const { clients, dellClient, setClients } = Clients
    const [filteredClients, setFilteredClients] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [selectedClient, setSelectedClient] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [clientToDelete, setClientToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Filter logic is now more efficient and runs whenever clients or searchQuery changes.
    useEffect(() => {
        let filtered = clients
        if (searchQuery) {
            filtered = clients.filter(
                client =>
                    client.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    client.phoneNumber?.includes(searchQuery)
            )
        }
        setFilteredClients(filtered)
    }, [clients, searchQuery])

    // Theme-based classes
    const layoutCard = theme === "light" ? "bg-white border border-gray-200" : "bg-gray-800 border border-gray-700"
    const inputClass = theme === "light" ? "bg-gray-50 border border-gray-300 text-gray-900" : "bg-gray-900 border border-gray-700 text-gray-100"
    const textClass = theme === "light" ? "text-black" : "text-gray-100"
    const mutedTextClass = theme === "light" ? "text-gray-500" : "text-gray-400"
    const buttonPrimaryClass = theme === "light" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-400"
    const buttonDestructiveClass = theme === "light" ? "bg-red-500 text-white hover:bg-red-600" : "bg-red-600 text-white hover:bg-red-700"

    const getInitials = (name) => {
        if (!name) return ""
        return name?.split(" ")?.map(n => n[0])?.join("")?.toUpperCase()?.slice(0, 2)
    }


    const handleDeleteClient = async () => {
        if (!clientToDelete) return
        setIsDeleting(true)
        setIsLoading(true)
        try {
            const result = await dellClient({ clientId: clientToDelete._id })

            if (result?.statusCode !== 200) {
                addAlert({ type: "error", message: "Error deleting client" })
            } else {
                setClients(prev => prev.filter(c => c._id !== clientToDelete._id))
                addAlert({ type: "success", message: "Client deleted successfully!" })
            }
        } catch (err) {
            addAlert({ type: "error", message: "Error deleting client" })
        } finally {
            setIsDeleting(false)
            setIsLoading(false)
            setShowDeleteModal(false)
            setClientToDelete(null)
        }
    }


    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={`text-3xl font-bold ${textClass}`}>Clients</h1>
                        <p className={mutedTextClass}>Manage your client information</p>
                    </div>
                    <button onClick={() => setShowAddForm(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${buttonPrimaryClass}`}>
                        <FiPlus className="h-4 w-4" /> Add Client
                    </button>
                </div>

                {/* Search Bar */}
                <div className={`${layoutCard} rounded-lg p-4`}>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search clients by name, email, company, or phone..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputClass}`}
                        />
                    </div>
                </div>

                {/* Clients List */}
                {isLoading ? (
                    <div className="space-y-4">{[...Array(4)].map((_, i) => <ClientSkeleton key={i} />)}</div>
                ) : filteredClients?.length === 0 ? (
                    <div className={`${layoutCard} rounded-lg p-8 text-center`}>
                        <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className={mutedTextClass}>{searchQuery ? "No clients found matching your search" : "No clients found"}</p>
                        {!searchQuery && (
                            <button onClick={() => setShowAddForm(true)} className={`mt-4 px-4 py-2 rounded-lg transition-colors ${buttonPrimaryClass}`}>Add Your First Client</button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.map(client => (
                            <div key={client?._id} className={`${layoutCard} rounded-lg p-6 hover:shadow-md transition-shadow`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">{getInitials(client?.fullName || "Client")}</div>
                                        <div>
                                            <h3 className={`font-semibold ${textClass}`}>{client?.fullName || "Client"}</h3>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setSelectedClient(client); setShowEditForm(true) }} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-accent rounded-lg transition-colors" title="Edit"><FiEdit className="h-4 w-4" /></button>
                                        <button onClick={() => { setClientToDelete(client); setShowDeleteModal(true) }} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><FiTrash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className={`flex items-center gap-2 ${textClass}`}>
                                        <FiMail className="h-4 w-4" /><span className={textClass}>{client?.email || "example@gmail.com"}</span>
                                    </div>
                                    {client.phoneNumber && <div className={`flex items-center gap-2 ${textClass}`}><FiPhone className="h-4 w-4" /><span className="truncate">{client?.phoneNumber || "000000000"}</span></div>}
                                    {client.address && <div className={`flex items-center gap-2 ${textClass}`}><FiMapPin className="h-4 w-4" /><span className="truncate">{client?.address || "address 123"}</span></div>}
                                </div>

                                {client.notes && <div className="mt-4 pt-4 border-t border-gray-200"><p className="text-sm text-gray-500 line-clamp-2">{client.notes}</p></div>}

                                <div className="mt-4 pt-4 border-t border-gray-200"><p className="text-xs text-gray-200">Added on {formatDate(client.createdAt) || "Today"}</p></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Forms */}
                <ClientForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} />
                <ClientForm isOpen={showEditForm} onClose={() => { setShowEditForm(false); setSelectedClient(null) }} clientData={selectedClient} isEdit={true} />

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className={`${layoutCard} rounded-lg p-6 w-full max-w-md mx-4`}>
                            <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>Delete Client</h3>
                            <p className={`${mutedTextClass} mb-6`}>Are you sure you want to delete "{clientToDelete?.fullName}"? This action cannot be undone.</p>
                            <div className="flex justify-end gap-4">
                                <button onClick={() => { setShowDeleteModal(false); setClientToDelete(null) }} className={`px-4 py-2 rounded-lg ${textClass} hover:text-foreground transition-colors`}>Cancel</button>
                                <button onClick={handleDeleteClient} disabled={isDeleting} className={`px-4 py-2 rounded-lg ${buttonDestructiveClass} ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {isDeleting ? <FiLoader className="h-4 w-4 animate-spin" /> : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default ClientPage