"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/Context/Context.jsx";
import { FiX, FiLoader, FiTrash2 } from "react-icons/fi";
import moment from "moment";
import "./CalendarStyles.css";

const HearingForm = ({ isOpen, onClose, hearingData = null, isEdit = false }) => {
    const { userData, addAlert, Cases, Lawyers, Hearings } = useApp();
    const { cases } = Cases;
    const { lawyers } = Lawyers;
    const { addHearing, editHearing, delHearing, setHearings, setUnReadNotifications, setUnreadMessages } = Hearings;

    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Minimum default new hearing start (2 hours from now)
    const minDateTime = moment().add(2, "hours").format("YYYY-MM-DDTHH:mm");

    // Determine whether full scheduling edits are allowed
    const allowFullEdit = useMemo(() => {
        if (!isEdit || !hearingData?.startsAt) return false;
        const startsAt = moment(hearingData.startsAt);
        const diffMinutes = startsAt.diff(moment(), "minutes");
        return diffMinutes >= 120; // >= 2 hours
    }, [isEdit, hearingData]);

    // Initialize form depending on add / edit and timing
    useEffect(() => {
        if (isEdit && hearingData) {
            // If full edit allowed (>=2 hours left) then populate scheduling fields
            if (allowFullEdit) {
                setForm({
                    hearingId: hearingData?._id,
                    caseId: hearingData?.caseId?._id,
                    subHandler: hearingData?.subHandler?._id,
                    title: hearingData?.title,
                    description: hearingData?.description,
                    startsAt: moment(hearingData?.startsAt).format("YYYY-MM-DDTHH:mm"),
                    courtLocation: hearingData?.courtLocation,
                    notify: hearingData?.notify,
                    reminderOffsetMinutes: hearingData?.reminderOffsetMinutes,
                    caseHandler: hearingData?.caseHandler,
                });
            } else {
                // Restricted post-hearing/tracking edits only
                setForm({
                    hearingId: hearingData._id,
                    title: hearingData.title || "",
                    description: hearingData.description || "",
                    durationMinutes: hearingData.durationMinutes ?? 60,
                    progress: hearingData.progress || "Scheduled",
                    progressDetails: hearingData.progressDetails || "",
                    reminderOffsetMinutes: hearingData.reminderOffsetMinutes ?? 15,
                });
            }
        } else {
            // New hearing default form
            setForm({
                caseId: "",
                subHandler: "",
                title: "",
                description: "",
                startsAt: minDateTime,
                courtLocation: "",
                notify: false,
                reminderOffsetMinutes: 15,
                caseHandler: userData?._id || "",
            });
        }
    }, [hearingData, isEdit, allowFullEdit, userData, minDateTime]);

    const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    // Validate scheduling fields for add / full edit
    const validateScheduling = () => {
        if (!form.caseId) {
            addAlert({ type: "error", message: "Please select a case." });
            return false;
        }
        if (!form.title || !form.startsAt || !form.courtLocation) {
            addAlert({ type: "error", message: "Please fill all required fields." });
            return false;
        }
        // Ensure startsAt is at least 2 hours from now for new hearings (your original rule)
        const startsAtMoment = moment(form.startsAt);
        if (!startsAtMoment.isValid()) {
            addAlert({ type: "error", message: "Invalid start time." });
            return false;
        }
        if (!isEdit) {
            if (startsAtMoment.diff(moment(), "minutes") < 120) {
            addAlert({ type: "error", message: "Start time must be at least 2 hours from now." });
            return false;
        }
        } else {
            // For full edit in edit mode ensure still allowed to modify time (we already checked allowFullEdit on init)
            if (!allowFullEdit && startsAtMoment.diff(moment(), "minutes") < 120) {
            addAlert({ type: "error", message: "Cannot set start time less than 2 hours from now in this edit mode." });
            return false;
            }
        }
        return true;
    };

    // Submit handler: respects allowed fields based on allowFullEdit / isEdit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                // Build payload based on allowed edits
                let payload = {};
                if (allowFullEdit) {
                    // allow scheduling + tracking fields
                    payload = {
                        hearingId: form.hearingId,
                        caseId: form.caseId,
                        subHandler: form.subHandler,
                        title: form.title,
                        description: form.description,
                        startsAt: form.startsAt ? moment(form.startsAt).toISOString() : null,
                        courtLocation: form.courtLocation,
                        notify: !!form.notify,
                        reminderOffsetMinutes: parseInt(form.reminderOffsetMinutes, 10) || 0,
                    };
                } else {
                    // restricted: only tracking fields
                    payload = {
                        hearingId: form.hearingId,
                        title: form.title,
                        description: form.description,
                        durationMinutes: parseInt(form.durationMinutes, 10) || 0,
                        progress: form.progress,
                        progressDetails: form.progressDetails,
                        reminderOffsetMinutes: parseInt(form.reminderOffsetMinutes, 10) || 0,
                    };
                }

                // Validate: if payload contains scheduling fields, validate them
                if (allowFullEdit && !validateScheduling()) {
                    setLoading(false);
                    return;
                }

                const result = await editHearing(payload);
                if (result?.success || result?.statusCode === 200) {
                    // Update local hearings state (replace)
                    setHearings(prev => prev.map(h => (h._id === (result.data?._id || form.hearingId) ? (result.data || { ...h, ...payload }) : h)));
                    // Optionally notify others via unread messages / notifications counters
                    if (typeof setUnreadMessages === "function") setUnreadMessages(prev => (typeof prev === "number" ? prev + 1 : prev + 1));
                    if (typeof setUnReadNotifications === "function") setUnReadNotifications(prev => (typeof prev === "number" ? prev + 1 : prev + 1));
                    addAlert({ type: "success", message: "Hearing updated successfully" });
                    onClose();
                } else {
                    addAlert({ type: "error", message: result?.message || "Failed to update hearing" });
                }
            } else {
                // Add new hearing: validate scheduling fields
                if (!validateScheduling()) {
                    setLoading(false);
                    return;
                }

                const payload = {
                    caseId: form.caseId,
                    subHandler: form.subHandler,
                    title: form.title,
                    description: form.description,
                    startsAt: form.startsAt ? moment(form.startsAt).toISOString() : null,
                    courtLocation: form.courtLocation,
                    notify: !!form.notify,
                    reminderOffsetMinutes: parseInt(form.reminderOffsetMinutes, 10) || 0,
                    caseHandler: form.caseHandler || userData?._id,
                };

                const result = await addHearing(payload);
                if (result?.statusCode === 200 || result?.success) {
                    setHearings(prev => [...(prev || []), result.data || payload]);
                    if (typeof setUnreadMessages === "function") setUnreadMessages(prev => (typeof prev === "number" ? prev + 1 : prev + 1));
                    if (typeof setUnReadNotifications === "function") setUnReadNotifications(prev => (typeof prev === "number" ? prev + 1 : prev + 1));
                    addAlert({ type: "success", message: "Hearing added successfully" });
                    onClose();
                } else {
                    addAlert({ type: "error", message: result?.message || "Failed to add hearing" });
                }
            }
        } catch (err) {
            addAlert({ type: "error", message: "Internal server error while saving hearing" });
        } finally {
            setLoading(false);
        }
    };

    // Delete hearing
    const handleDelete = async () => {
        if (!form.hearingId) return;
        setLoading(true);
        try {
            const result = await delHearing({ hearingId: form.hearingId });
            if (result?.statusCode === 200 || result?.success) {
                setHearings(prev => prev.filter(h => h._id !== form.hearingId));
                addAlert({ type: "success", message: "Hearing deleted successfully" });
                setShowDeleteConfirm(false);
                onClose();
            } else {
                addAlert({ type: "error", message: result?.message || "Failed to delete hearing" });
            }
        } catch (err) {
            addAlert({ type: "error", message: "Internal server error while deleting hearing" });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-black";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-black text-xl font-semibold">{isEdit ? "Edit Hearing" : "Add Hearing"}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-200">
                            <FiX className="w-5 h-5 text-black" />
                        </button>
                    </div>

                    {/* Full Edit / Add Fields */}
                    {(!isEdit || (isEdit && allowFullEdit)) && (
                        <>
                            <label className="text-black">Case</label>
                            <select value={form.caseId || ""} required onChange={e => update("caseId", e.target.value)} className={inputClass}>
                                <option value="">Select Case</option>
                                {cases?.map(c => <option key={c._id} value={c._id}>{c.caseTitle}</option>)}
                            </select>

                            {userData?.role === "Law Firm" && (
                                <>
                                    <label className="text-black">Sub Handler (Lawyer)</label>
                                    <select value={form.subHandler || ""} onChange={e => update("subHandler", e.target.value)} className={inputClass}>
                                        <option value="">Select Lawyer</option>
                                        {lawyers?.map(l => <option key={l._id} value={l._id}>{l.fullName}</option>)}
                                    </select>
                                </>
                            )}

                            <label className="text-black">Title</label>
                            <input type="text" value={form.title || ""} onChange={e => update("title", e.target.value)} required className={inputClass} />

                            <label className="text-black">Description</label>
                            <textarea value={form.description || ""} onChange={e => update("description", e.target.value)} rows={3} className={inputClass} />

                            <label className="text-black">Start Time</label>
                            <input type="datetime-local" value={form.startsAt || ""} min={minDateTime} onChange={e => update("startsAt", e.target.value)} required className={inputClass} />

                            <label className="text-black">Court Location</label>
                            <input type="text" value={form.courtLocation || ""} onChange={e => update("courtLocation", e.target.value)} required className={inputClass} />

                            <label className="text-black">Reminder Offset (minutes)</label>
                            <input type="number" value={form.reminderOffsetMinutes ?? 15} onChange={e => update("reminderOffsetMinutes", parseInt(e.target.value, 10) || 0)} className={inputClass} />

                            <label className="text-black flex items-center gap-2">
                                <input type="checkbox" checked={!!form.notify} onChange={e => update("notify", e.target.checked)} />
                                Notify
                            </label>
                        </>
                    )}

                    {/* Restricted Edit */}
                    {isEdit && !allowFullEdit && (
                        <>
                            <label className="text-black">Title</label>
                            <input type="text" value={form.title || ""} onChange={e => update("title", e.target.value)} className={inputClass} />
                            <label className="text-black">Description</label>
                            <textarea value={form.description || ""} onChange={e => update("description", e.target.value)} rows={3} className={inputClass} />
                            <label className="text-black">Duration (minutes)</label>
                            <input type="number" value={form.durationMinutes ?? 60} onChange={e => update("durationMinutes", parseInt(e.target.value, 10) || 0)} className={inputClass} />
                            <label className="text-black">Reminder Offset (minutes)</label>
                            <input type="number" value={form.reminderOffsetMinutes ?? 15} onChange={e => update("reminderOffsetMinutes", parseInt(e.target.value, 10) || 0)} className={inputClass} />
                            <label className="text-black">Progress</label>
                            <select value={form.progress || "Scheduled"} onChange={e => update("progress", e.target.value)} className={inputClass}>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Adjourned">Adjourned</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <label className="text-black">Progress Details</label>
                            <textarea value={form.progressDetails || ""} onChange={e => update("progressDetails", e.target.value)} rows={3} className={inputClass} />
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row justify-between gap-2 mt-4">
                        <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {loading ? <FiLoader className="animate-spin" /> : (isEdit ? "Update Hearing" : "Add Hearing")}
                        </button>

                        {isEdit && (
                            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700">
                                <FiTrash2 /> Delete
                            </button>
                        )}
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-6 rounded-lg max-w-sm w-full flex flex-col gap-4">
                                <h3 className="text-lg font-semibold text-black">Delete Hearing?</h3>
                                <p className="text-black">Are you sure you want to delete this hearing?</p>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-2 rounded-lg bg-gray-300">Cancel</button>
                                    <button onClick={handleDelete} className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default HearingForm;
