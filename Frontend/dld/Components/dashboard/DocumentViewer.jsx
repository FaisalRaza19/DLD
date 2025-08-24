"use client"
import React, { useState, useEffect } from "react"
import { FiX, FiZoomIn, FiZoomOut, FiDownload, FiMaximize2, FiMinimize2 } from "react-icons/fi"
import JSZip from "jszip"
import { saveAs } from "file-saver"

const DocumentViewer = ({ isOpen, onClose, singleDocument, documents = [] }) => {
  const [currentDocIndex, setCurrentDocIndex] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isZipping, setIsZipping] = useState(false)

  useEffect(() => {
    if (singleDocument && documents.length > 0) {
      const index = documents.findIndex((doc) => doc.id === singleDocument.id);
      setCurrentDocIndex(index !== -1 ? index : 0);
    } else {
      setCurrentDocIndex(0);
    }
  }, [singleDocument, documents]);


  if (!isOpen || (!singleDocument && documents.length === 0)) return null

  const currentDoc = documents?.length > 0 ? documents[currentDocIndex] : singleDocument
  if (!currentDoc) return null;

  const isImage = currentDoc.mimeType?.startsWith("image/") || currentDoc.docUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const isPdf = currentDoc.mimeType === "application/pdf" || currentDoc.docUrl?.endsWith(".pdf")

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25))

  const handleDownload = () => {
    saveAs(currentDoc.docUrl, currentDoc.originalName || "document");
  }

  const handleDownloadAll = async () => {
    if (!documents || documents.length === 0) return

    setIsZipping(true)
    try {
      const zip = new JSZip()
      const downloadPromises = documents.map((doc) =>
        fetch(doc.docUrl)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${doc.originalName}`)
            return res.blob()
          })
          .then((blob) => {
            zip.file(doc.originalName, blob)
          })
      )

      await Promise.all(downloadPromises)

      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, "case-documents.zip")

    } catch (error) {
      alert("Failed to create zip file")
    } finally {
      setIsZipping(false)
    }
  }

  return (
    <div className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 ${isFullscreen ? "p-0" : "p-4"}`}>
      <div
        className={`bg-background border border-border rounded-lg overflow-hidden flex flex-col ${isFullscreen ? "w-full h-full" : "w-full max-w-6xl h-[90vh]"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-background">
          <div className="flex items-center gap-4 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{currentDoc.originalName}</h3>
            {documents?.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDocIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentDocIndex === 0}
                  className="px-2 py-1 text-sm bg-secondary text-secondary-foreground rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  {currentDocIndex + 1} of {documents?.length}
                </span>
                <button
                  onClick={() => setCurrentDocIndex((prev) => Math.min(documents?.length - 1, prev + 1))}
                  disabled={currentDocIndex === documents?.length - 1}
                  className="px-2 py-1 text-sm bg-secondary text-secondary-foreground rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Zoom Controls */}
            {isImage && (
              <>
                <button onClick={handleZoomOut} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors" title="Zoom Out">
                  <FiZoomOut className="h-4 w-4" />
                </button>
                <span className="text-sm text-muted-foreground min-w-[3rem] text-center">{zoom}%</span>
                <button onClick={handleZoomIn} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors" title="Zoom In">
                  <FiZoomIn className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Download Buttons */}
            <button onClick={handleDownload} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors" title="Download">
              <FiDownload className="h-4 w-4" />
            </button>

            {documents?.length > 1 && (
              <button
                onClick={handleDownloadAll}
                disabled={isZipping}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:bg-primary/50"
                title="Download All"
              >
                {isZipping ? 'Zipping...' : 'Download All'}
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              {isFullscreen ? <FiMinimize2 className="h-4 w-4" /> : <FiMaximize2 className="h-4 w-4" />}
            </button>

            {/* Close Button */}
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors" title="Close">
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto bg-muted/20 flex items-center justify-center">
          {isImage ? (
            <img
              src={currentDoc.docUrl || "/placeholder.svg"}
              alt={currentDoc.originalName}
              style={{
                transform: `scale(${zoom / 100})`,
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
              className="transition-transform duration-200"
            />
          ) : isPdf ? (
            <iframe src={currentDoc.docUrl} className="w-full h-full border-0" title={currentDoc.originalName} />
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentViewer

