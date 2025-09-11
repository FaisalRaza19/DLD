"use client"
import React, { useState, useEffect } from "react"
import { useApp } from "@/Context/Context.jsx"
import { FiX, FiLoader } from "react-icons/fi"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import "react-phone-number-input/style.css"

const ClientForm = ({ isOpen, onClose, clientData = null, isEdit = false }) => {
  const { addAlert, Clients } = useApp()
  const { addClient, editClient, setClients } = Clients

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
  })

  useEffect(() => {
    if (isEdit && clientData) {
      setFormData({
        fullName: clientData.fullName || "",
        email: clientData.email || "",
        phoneNumber: clientData.phoneNumber || "",
        address: clientData.address || "",
      })
    } else {
      setFormData({ fullName: "", email: "", phoneNumber: "", address: "" })
    }
  }, [isEdit, clientData, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phoneNumber: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
      return addAlert({ type: "error", message: "Invalid phone number!" })
    }

    setLoading(true)
    try {
      let result
      if (isEdit) {
        const data = { clientId: clientData._id, ...formData }
        result = await editClient({ formData: data })
        if (result.statusCode === 200 && result.data) {
          setClients(prev => prev.map(c => c._id === clientData._id ? result.data : c))
          addAlert({ type: "success", message: "Client updated successfully!" })
        } else {
          addAlert({ type: "error", message: result.error || "Failed to update client" })
        }
      } else {
        result = await addClient(formData)
        if (result.statusCode === 200 && result.data) {
          setClients(prev => [result.data, ...prev])
          addAlert({ type: "success", message: "Client created successfully!" })
        } else {
          addAlert({ type: "error", message: result.error || "Failed to create client" })
        }
      }

      if (result.statusCode === 200) {
        onClose()
        setFormData({ fullName: "", email: "", phoneNumber: "", address: "" })
      }
    } catch {
      addAlert({ type: "error", message: "An error occurred while saving the client" })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">{isEdit ? "Edit Client" : "Add New Client"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Enter client's full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
            <PhoneInput
              defaultCountry="US"
              international
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter client's address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-900 flex items-center gap-2 justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <FiLoader className="h-4 w-4 animate-spin" />}
              {isEdit ? "Update Client" : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientForm
