"use client"
import React, { useState, useEffect } from "react"
import { useApp } from "@/Context/Context.jsx"
import { FiX, FiLoader } from "react-icons/fi"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import "react-phone-number-input/style.css"

const ClientForm = ({ isOpen, onClose, clientData = null, isEdit = false }) => {
  const { addAlert, theme, Clients } = useApp()
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
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value }))
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
          setClients(prev =>
            prev.map(c => c._id === clientData._id ? result.data : c)
          )
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
    } catch (error) {
      addAlert({ type: "error", message: "An error occurred while saving the client" })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Theme classes
  const bg = theme === "light" ? "bg-white" : "bg-gray-800"
  const border = theme === "light" ? "border-gray-200" : "border-gray-700"
  const inputBg = theme === "light" ? "bg-white" : "bg-gray-700"
  const inputText = theme === "light" ? "text-black" : "text-gray-100"
  const phoneText = theme === "light" ? "text-black" : "text-gray-500"
  const mutedText = theme === "light" ? "text-gray-500" : "text-gray-400"
  const primaryButton =
    theme === "light"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-blue-500 text-white hover:bg-blue-400"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${bg} border ${border}`}>
        <div className={`flex justify-between items-center p-6 border-b ${border}`}>
          <h2 className={`text-xl font-semibold ${inputText}`}>{isEdit ? "Edit Client" : "Add New Client"}</h2>
          <button onClick={onClose} className={`${mutedText} hover:${inputText} transition-colors`}>
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${inputText} mb-2`}>Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 ${inputBg} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputText}`}
                placeholder="Enter client's full name"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${inputText} mb-2`}>Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 ${inputBg} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputText}`}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${inputText} mb-2`}>
              Phone Number
            </label>
            <PhoneInput
              defaultCountry="US"
              international
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter phone number"
              className={`${inputBg} border ${border} h-8 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${phoneText}`}
            />
          </div>


          <div>
            <label className={`block text-sm font-medium ${inputText} mb-2`}>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 ${inputBg} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputText}`}
              placeholder="Enter client's address"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <button type="button" onClick={onClose} disabled={loading} className={`px-4 py-2 rounded-lg ${mutedText} hover:${inputText} transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>Cancel</button>
            <button type="submit" disabled={loading} className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center ${primaryButton} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
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
