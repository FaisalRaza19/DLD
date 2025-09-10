"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useApp } from "@/Context/Context.jsx"
import {
  FiX, FiUpload, FiFile, FiTrash2, FiEye, FiZoomIn, FiZoomOut,
  FiLoader, FiDownload, FiChevronLeft, FiChevronRight
} from "react-icons/fi"
import { saveAs } from "file-saver"
import JSZip from "jszip"


const CaseForm = ({ isOpen, onClose, caseData = null, isEdit = false, setCaseData }) => {
  const { Cases, addAlert, theme, userData, Lawyers, Clients } = useApp()
  const { lawyers } = Lawyers
  const { clients } = Clients
  const { addCase, editCase, setCases } = Cases

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    caseTitle: "",
    caseDescription: "",
    caseType: "",
    clientId: "",
    lawyerId: "",
    docs: [],
    caseId: undefined
  })

  const [newFiles, setNewFiles] = useState([])
  const [previewIndex, setPreviewIndex] = useState(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (!isOpen) return
    if (isEdit && caseData) {
      setFormData({
        caseId: caseData?._id,
        caseTitle: caseData?.caseTitle || "",
        caseDescription: caseData?.caseDescription || "",
        caseType: caseData?.caseType || "",
        clientId: caseData?.client?._id || caseData?.client || "",
        lawyerId: caseData?.lawyer?._id || caseData?.lawyer || "",
        docs: (caseData?.caseDocs || [])
          .filter(d => d?.isShowing)
          .map(d => ({
            name: d?.originalName,
            public_id: d?.publicId,
            url: d?.docUrl,
            isShowing: true
          }))
      })
    } else {
      setFormData({
        caseTitle: "",
        caseDescription: "",
        caseType: "",
        clientId: "",
        lawyerId: "",
        docs: [],
        caseId: undefined
      })
    }
    setNewFiles([])
    setPreviewIndex(null)
    setZoom(1)
  }, [isOpen, isEdit, caseData])

  // check file is image or pdf
  const isImageUrl = (url = "") => /\.(gif|jpe?g|png|webp|bmp|svg)$/i.test(url)
  const isImageFile = (file) => file && typeof file.type === "string" && file.type.startsWith("image/")

  // Build a flat list for preview
  const previewItems = useMemo(() => {
    const existing = formData.docs.map(d => ({
      kind: "existing",
      name: d.name,
      url: d.url,
      public_id: d.public_id
    }))
    const news = newFiles.map(f => ({
      kind: "new",
      name: f.name,
      file: f,
      url: URL.createObjectURL(f)
    }))
    return [...existing, ...news]
  }, [formData.docs, newFiles])

  const currentPreview = previewIndex !== null ? previewItems[previewIndex] : null

  // Cleanup object URLs on unmount or when newFiles change
  useEffect(() => {
    return () => {
      previewItems.forEach(item => {
        if (item.kind === "new" && item.url?.startsWith("blob:")) {
          try { URL.revokeObjectURL(item.url) } catch { }
        }
      })
    }
  }, [previewItems])

  // handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setNewFiles(prev => [...prev, ...files])
    if (previewIndex === null && (formData.docs.length + files.length) > 0) {
      setPreviewIndex(formData.docs.length)
    }
  }

  // remove existing files
  const removeExistingFile = (public_id) => {
    setFormData(prev => ({
      ...prev,
      docs: prev.docs.filter(d => d.public_id !== public_id)
    }))
    // fix preview pointer if needed
    if (previewIndex !== null) {
      const list = previewItems
      const idxToRemove = list.findIndex(it => it.kind === "existing" && it.public_id === public_id)
      if (idxToRemove !== -1) {
        const next = list.length > 1 ? (idxToRemove % (list.length - 1)) : null
        setPreviewIndex(next)
      }
    }
  }

  // remove file
  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    if (previewIndex !== null) {
      const existingCount = formData.docs.length
      const globalIdx = existingCount + index
      if (previewIndex === globalIdx) {
        // move to a valid neighbor after removal
        const newTotal = previewItems.length - 1
        setPreviewIndex(newTotal > 0 ? Math.max(0, globalIdx - 1) : null)
      } else if (previewIndex > globalIdx) {
        setPreviewIndex(previewIndex - 1)
      }
    }
  }

  const handleDownloadSingle = (url, name) => {
    try {
      saveAs(url, name)
    } catch (e) {
      addAlert({ type: "error", message: "File download failed." })
    }
  }

  // Download All — ONLY existing and visible docs (per your requirement)
  const handleDownloadAllZip = async () => {
    if (!formData.docs.length) {
      addAlert({ type: "warning", message: "No existing documents to download." })
      return
    }
    try {
      const zip = new JSZip()
      for (const doc of formData.docs) {
        // fetch as blob and add into zip
        const res = await fetch(doc.url, { credentials: "include" }).catch(() => null)
        if (!res || !res.ok) continue
        const blob = await res.blob()
        // If duplicate names exist, JSZip will override; add a disambiguator
        const safeName = doc.name || `${doc.public_id}.file`
        zip.file(safeName, blob)
      }
      const zipBlob = await zip.generateAsync({ type: "blob" })
      saveAs(zipBlob, `${formData.caseTitle || "case"}-docs.zip`)
    } catch (err) {
      addAlert({ type: "error", message: "Failed to create ZIP for download." })
    }
  }

  const openPreviewAt = (idx) => {
    setPreviewIndex(idx)
    setZoom(1)
  }

  const closePreview = () => {
    setPreviewIndex(null)
    setZoom(1)
  }
  const prevPreview = () => {
    if (previewItems.length === 0 || previewIndex === null) return
    setPreviewIndex((previewIndex - 1 + previewItems.length) % previewItems.length)
    setZoom(1)
  }
  const nextPreview = () => {
    if (previewItems.length === 0 || previewIndex === null) return
    setPreviewIndex((previewIndex + 1) % previewItems.length)
    setZoom(1)
  }

  const zoomIn = () => setZoom(z => Math.min(z + 0.25, 3))
  const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()

    fd.append("caseTitle", formData.caseTitle)
    fd.append("caseDescription", formData.caseDescription)
    fd.append("caseType", formData.caseType)
    fd.append("clientId", formData.clientId)
    if (userData?.role === "Law Firm") {
      fd.append("lawyerId", formData.lawyerId)
    }

    // New uploads
    newFiles.forEach(f => fd.append("docs", f))

    try {
      let result
      if (isEdit && formData.caseId) {
        // IMPORTANT: Backend expects array of objects with { publicId }
        const keepDocs = formData.docs.map(d => ({ publicId: d.public_id }))
        fd.append("caseDocs", JSON.stringify(keepDocs))

        result = await editCase(formData.caseId, fd)
        if (result?.statusCode === 200) {
          setCases(prev => prev.map(c => (c._id === formData.caseId ? result.data : c)))
          if (setCaseData) {
            setCaseData(result?.data)
          }
          addAlert({ type: "success", message: "Case updated successfully!" })
          onClose()
        } else {
          addAlert({ type: "error", message: result?.message || result?.error || "Failed to update case" })
        }
      } else {
        result = await addCase(fd)
        if (result?.statusCode === 200) {
          setCases(prev => [result.data, ...prev])
          addAlert({ type: "success", message: "Case created successfully!" })
          onClose()
        } else {
          addAlert({ type: "error", message: result?.message || result?.error || "Failed to create case" })
        }
      }
    } catch (err) {
      addAlert({ type: "error", message: "An unexpected error occurred." })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // ---------- Theme ----------
  const bg = theme === "light" ? "bg-white" : "bg-gray-900"
  const card = theme === "light" ? "bg-gray-100" : "bg-gray-800"
  const border = theme === "light" ? "border-gray-300" : "border-gray-700"
  const text = theme === "light" ? "text-gray-800" : "text-gray-100"
  const muted = theme === "light" ? "text-gray-500" : "text-gray-400"
  const primaryBtn = theme === "light" ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
  const destructive = theme === "light" ? "text-red-500 hover:text-red-600" : "text-red-400 hover:text-red-500"
  const caseTypes = ["Civil", "Criminal", "Family", "Corporate", "Tax", "Property", "Constitutional", "Other"]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${bg} border ${border} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${border}`}>
          <h2 className={`text-xl font-semibold ${text}`}>{isEdit ? "Edit Case" : "Add New Case"}</h2>
          <div className="flex items-center gap-2">
            {/* Download All (ZIP) — only existing visible docs */}
            {formData.docs.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadAllZip}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                title="Download all existing visible documents as ZIP"
              >
                <FiDownload className="h-4 w-4" /> Download All
              </button>
            )}
            <button onClick={onClose} className={`${muted} hover:${text} transition-colors`}><FiX className="h-6 w-6" /></button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title + Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${text} mb-2`}>Case Title</label>
              <input
                type="text"
                name="caseTitle"
                value={formData.caseTitle}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 ${bg} ${text} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter case title"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${text} mb-2`}>Case Type</label>
              <select
                name="caseType"
                value={formData.caseType}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 ${bg} ${text} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select case type</option>
                {caseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Description</label>
            <textarea
              name="caseDescription"
              value={formData.caseDescription}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 ${bg} ${text} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter case description"
            />
          </div>

          {/* Client */}
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Client</label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 ${bg} ${text} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select client</option>
              {clients?.map(c => <option key={c._id} value={c._id}>{c.fullName}</option>)}
            </select>
          </div>

          {/* Lawyer (Law Firm only) */}
          {userData?.role === "Law Firm" && (
            <div>
              <label className={`block text-sm font-medium ${text} mb-2`}>Assign Lawyer</label>
              <select
                name="lawyerId"
                value={formData.lawyerId}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 ${bg} ${text} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select lawyer</option>
                {lawyers?.map(l => <option key={l._id} value={l._id}>{l.fullName}</option>)}
              </select>
            </div>
          )}

          {/* Existing Docs */}
          <div className="space-y-2">
            {formData.docs.length > 0 && (
              <label className={`block text-sm font-medium ${text}`}>Existing Documents</label>
            )}
            {formData.docs.map((doc, i) => (
              <div key={doc.public_id} className={`flex justify-between items-center p-3 ${card} rounded-lg`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <FiFile className={`h-4 w-4 ${muted} flex-shrink-0`} />
                  <span className={`${text} truncate`} title={doc.name}>{doc.name}</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openPreviewAt(i)}
                    className={`${primaryBtn} p-1 rounded`}
                    title="Preview"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(doc.url, doc.name)}
                    className="bg-green-500 hover:bg-green-600 text-white p-1 rounded"
                    title="Download"
                  >
                    <FiDownload className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExistingFile(doc.public_id)}
                    className={`${destructive} p-1 rounded`}
                    title="Hide (mark removed on save)"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* New Files */}
            {newFiles.length > 0 && (
              <label className={`block text-sm font-medium ${text} pt-2`}>New Documents</label>
            )}
            {newFiles.map((file, idx) => (
              <div key={idx} className={`flex justify-between items-center p-3 ${card} rounded-lg`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <FiFile className={`h-4 w-4 ${muted} flex-shrink-0`} />
                  <span className={`${text} truncate`} title={file.name}>{file.name}</span>
                  <span className={`${muted} text-xs flex-shrink-0`}>
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openPreviewAt(formData.docs.length + idx)}
                    className={`${primaryBtn} p-1 rounded`}
                    title="Preview"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeNewFile(idx)}
                    className={`${destructive} p-1 rounded`}
                    title="Remove"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload */}
          <div>
            <label className={`block text-sm font-medium ${text} mb-2`}>Upload New Documents</label>
            <div
              className={`border-2 border-dashed ${border} rounded-lg p-6 text-center cursor-pointer`}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <FiUpload className={`h-8 w-8 ${muted} mx-auto mb-2`} />
              <p className={`${muted} mb-2`}>Drag & drop files here, or click to select</p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-300">
            <button type="button" onClick={onClose} className={`${muted} hover:${text} px-4 py-2 rounded-lg`}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${primaryBtn} px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50`}
            >
              {loading && <FiLoader className="animate-spin h-5 w-5" />}
              {isEdit ? "Update Case" : "Create Case"}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {currentPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`relative ${bg} border ${border} rounded-lg p-4 max-w-full md:max-w-3xl w-full max-h-full overflow-auto`}>
            {/* Top bar */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevPreview} className="p-2 rounded hover:bg-white/10" title="Previous">
                <FiChevronLeft className="h-6 w-6 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <button onClick={zoomOut} className="p-2 rounded hover:bg-white/10" title="Zoom out">
                  <FiZoomOut className="h-5 w-5 text-white" />
                </button>
                <span className="text-white text-sm">{Math.round(zoom * 100)}%</span>
                <button onClick={zoomIn} className="p-2 rounded hover:bg-white/10" title="Zoom in">
                  <FiZoomIn className="h-5 w-5 text-white" />
                </button>
              </div>
              <button onClick={nextPreview} className="p-2 rounded hover:bg-white/10" title="Next">
                <FiChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Canvas */}
            <div className="flex justify-center items-center overflow-auto">
              {/* Decide image vs iframe */}
              {(
                (currentPreview.kind === "existing" && isImageUrl(currentPreview.url)) ||
                (currentPreview.kind === "new" && isImageFile(currentPreview.file))
              ) ? (
                <img
                  src={currentPreview.url}
                  alt={currentPreview.name}
                  style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                  className="max-w-full max-h-[75vh] select-none"
                  draggable={false}
                />
              ) : (
                <iframe
                  src={currentPreview.url}
                  className="w-full h-[75vh] bg-white"
                  title={currentPreview.name}
                />
              )}
            </div>

            {/* Footer bar */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-white/80 truncate">{currentPreview.name}</span>
              <div className="flex items-center gap-2">
                {currentPreview.kind === "existing" && (
                  <button
                    onClick={() => handleDownloadSingle(currentPreview.url, currentPreview.name)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2"
                    title="Download"
                  >
                    <FiDownload />
                    <span className="text-sm">Download</span>
                  </button>
                )}
                <button onClick={closePreview} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-2">
                  <FiX />
                  <span className="text-sm">Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CaseForm

