"use client"
import { useState, useEffect } from "react"
import { useApp } from "@/Context/Context.jsx"
import { FiX, FiLoader } from "react-icons/fi"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import "react-phone-number-input/style.css"

const LawyerForm = ({ isOpen, onClose, lawyerData = null, isEdit = false }) => {
    const { addAlert, Lawyers } = useApp()
    const { addLawyer, editLawyer, setLawyers } = Lawyers

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        lawyerId: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        address: "",
        specialization: "",
        experience: "",
    })

    useEffect(() => {
        if (isEdit && lawyerData) {
            setFormData({
                lawyerId: lawyerData?._id || "",
                fullName: lawyerData?.fullName || "",
                email: lawyerData?.email || "",
                phoneNumber: lawyerData?.phoneNumber || "",
                address: lawyerData?.address || "",
                specialization: lawyerData?.specialization || "",
                experience: lawyerData?.experience || "",
            })
        }
    }, [isEdit, lawyerData])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({ ...prev, phoneNumber: value }))
    }

    const validate = () => {
        let newErrors = {}
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Valid email is required"
        if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required"
        if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
            return addAlert({ type: "error", message: "Invalid phone number!" })
        }
        if (formData.experience && (formData.experience < 0 || formData.experience > 50)) {
            newErrors.experience = "Experience must be between 0 and 50 years"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            if (isEdit) {
                const updated = await editLawyer({ formData })
                if (updated.statusCode === 200) {
                    addAlert({ type: "success", message: "Lawyer updated successfully!" })
                    setLawyers((prev) =>
                        prev.map((c) => (c._id === lawyerData._id ? updated.data : c))
                    )
                    onClose()
                } else {
                    addAlert({ type: "error", message: "Failed to update lawyer" })
                }
            } else {
                const added = await addLawyer(formData)
                if (added.statusCode === 200) {
                    setLawyers((prev) => [added.data, ...prev])
                    addAlert({ type: "success", message: "Lawyer added successfully!" })
                    onClose()
                } else {
                    addAlert({ type: "error", message: "Failed to add lawyer" })
                }
            }

            setFormData({
                lawyerId: "",
                fullName: "",
                email: "",
                phoneNumber: "",
                address: "",
                specialization: "",
                experience: "",
            })
        } catch (error) {
            addAlert({ type: "error", message: "An error occurred while saving the lawyer" })
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-black">
                        {isEdit ? "Edit Lawyer" : "Add New Lawyer"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-black">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Enter lawyer's full name"
                                required
                            />
                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-black">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Enter email address"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-black">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <PhoneInput
                            international
                            defaultCountry="US"
                            value={formData.phoneNumber}
                            onChange={handlePhoneChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        />
                        {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                    </div>

                    {/* Specialization & Experience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-black">Specialization</label>
                            <select
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="">Select specialization</option>
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

                        <div>
                            <label className="block text-sm font-medium mb-2 text-black">Years of Experience</label>
                            <input
                                type="number"
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                min="0"
                                max="50"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Enter years of experience"
                            />
                            {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-black">Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Enter lawyer's address"
                            required
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col md:flex-row justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg border border-gray-400 text-black hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-black text-white flex items-center gap-2 hover:bg-gray-900 transition-colors"
                        >
                            {loading ? <><FiLoader className="animate-spin h-5 w-5" /> Saving...</> : isEdit ? "Update Lawyer" : "Add Lawyer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LawyerForm
