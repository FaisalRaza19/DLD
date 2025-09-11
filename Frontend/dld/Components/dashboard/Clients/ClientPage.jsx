"use client"
import React, { useState, useEffect } from "react"
import { useApp } from "@/Context/Context.jsx"
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx"
import ClientForm from "./ClientForm.jsx"
import ClientSkeleton from "@/Components/Skeletons/ClientSkeleton.jsx"
import { formatDate } from "@/Components/formatDate.js"
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiLoader } from "react-icons/fi"

const ClientPage = () => {
    const { addAlert, Clients } = useApp()
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

    useEffect(() => {
        if (!searchQuery) {
            setFilteredClients(clients)
        } else {
            setFilteredClients(
                clients.filter(client =>
                    client.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    client.phoneNumber?.includes(searchQuery)
                )
            )
        }
    }, [clients, searchQuery])

    const getInitials = (name) => {
        if (!name) return ""
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
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
        } catch {
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                    <div>
                        <h1 className="text-3xl font-bold text-black">Clients</h1>
                        <p className="text-gray-600">Manage your client information</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
                    >
                        <FiPlus className="h-4 w-4" /> Add Client
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search clients by name, email, or phone..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                </div>

                {/* Clients List */}
                {isLoading ? (
                    <div className="space-y-4">{[...Array(4)].map((_, i) => <ClientSkeleton key={i} />)}</div>
                ) : filteredClients?.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                        <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">{searchQuery ? "No clients found" : "No clients found"}</p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="mt-4 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
                            >
                                Add Your First Client
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.map(client => (
                            <div key={client._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                                            {getInitials(client.fullName || "Client")}
                                        </div>
                                        <h3 className="font-semibold text-black">{client.fullName || "Client"}</h3>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { setSelectedClient(client); setShowEditForm(true) }}
                                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <FiEdit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => { setClientToDelete(client); setShowDeleteModal(true) }}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-black">
                                        <FiMail className="h-4 w-4" /> <span>{client.email || "example@gmail.com"}</span>
                                    </div>
                                    {client.phoneNumber && (
                                        <div className="flex items-center gap-2 text-black">
                                            <FiPhone className="h-4 w-4" /> <span className="truncate">{client.phoneNumber}</span>
                                        </div>
                                    )}
                                    {client.address && (
                                        <div className="flex items-center gap-2 text-black">
                                            <FiMapPin className="h-4 w-4" /> <span className="truncate">{client.address}</span>
                                        </div>
                                    )}
                                </div>

                                {client.notes && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500 line-clamp-2">{client.notes}</p>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-400">Added on {formatDate(client.createdAt) || "Today"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Forms */}
                <ClientForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} />
                <ClientForm
                    isOpen={showEditForm}
                    onClose={() => { setShowEditForm(false); setSelectedClient(null) }}
                    clientData={selectedClient}
                    isEdit
                />

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-black mb-4">Delete Client</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete "{clientToDelete?.fullName}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setClientToDelete(null) }}
                                    className="px-4 py-2 rounded-lg text-black hover:text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteClient}
                                    disabled={isDeleting}
                                    className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
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

export default ClientPage
