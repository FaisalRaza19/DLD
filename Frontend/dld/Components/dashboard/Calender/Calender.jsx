"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx";
import { useApp } from "@/Context/Context.jsx";
import moment from "moment";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { FiCalendar, FiPlus } from "react-icons/fi";
import HearingForm from "./HearingForm.jsx";
import "./CalendarStyles.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const CalendarPage = () => {
  const { Hearings, addAlert } = useApp();
  const { hearings, setHearings } = Hearings;

  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Default agenda view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setView(Views.AGENDA);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Event styling
  // Event styling based on progress
  const eventPropGetter = useCallback(
    (event) => {
      let backgroundColor = "#3b82f6"; // default blue for Scheduled

      switch (event.progress) {
        case "Scheduled":
          backgroundColor = "#3b82f6"; // blue
          break;
        case "Adjourned":
          backgroundColor = "#f59e0b"; // amber/orange
          break;
        case "Completed":
          backgroundColor = "#10b981"; // green
          break;
        case "Cancelled":
          backgroundColor = "#ef4444"; // red
          break;
        default:
          backgroundColor = "#6b7280"; // gray
      }

      return {
        style: {
          backgroundColor,
          borderRadius: "6px",
          color: "#fff",
          border: "none",
          padding: "2px 4px",
          fontWeight: "500",
        },
      };
    }, []);


  // Dates with hearings
  const hearingDates = useMemo(() => {
    const map = new Set();
    hearings.forEach((h) => map.add(moment(h.startsAt).format("YYYY-MM-DD")));
    return map;
  }, [hearings]);

  const hasHearingOnDate = useCallback(
    (date) => hearingDates.has(moment(date).format("YYYY-MM-DD")),
    [hearingDates]
  );

  // Prevent adding hearings on past-empty dates
  const handleSelectSlot = useCallback(
    ({ start }) => {
      const isPast = moment(start).isBefore(moment(), "day");
      if (isPast && !hasHearingOnDate(start)) {
        alert("Cannot add hearings on past empty dates.");
        return;
      }
      setSelectedHearing({ startsAt: start });
      setIsFormOpen(true);
    },
    [hasHearingOnDate]
  );

  // Open existing hearing
  const handleSelectEvent = useCallback((event) => {
    setSelectedHearing(event);
    setIsFormOpen(true);
  }, []);

  // Move hearings
  const moveEvent = async ({ event, start, end }) => {
    const isPast = moment(start).isBefore(moment(), "day");
    if (isPast && !hasHearingOnDate(start)) {
      alert("Cannot move hearings to past empty dates.");
      return;
    }

    const updatedData = {
      startsAt: start.toISOString(),
      durationMinutes: moment(end).diff(moment(start), "minutes"),
    };

    try {
      const res = await Hearings.editHearing(event._id, updatedData);
      if (res.success) {
        setHearings((prev) =>
          prev.map((h) => (h._id === event._id ? res.data : h))
        );
      }
    } catch (err) {
      addAlert({ statusCode: 500, message: "Failed to update hearing" });
    }
  };

  // Prepare events
  const events = useMemo(
    () =>
      hearings.map((h) => ({
        ...h,
        start: new Date(h.startsAt),
        end: moment(h.startsAt).add(h.durationMinutes, "minutes").toDate(),
      })),
    [hearings]
  );

  // Day cell styling
  const dayPropGetter = useCallback(
    (date) => {
      const isPast = moment(date).isBefore(moment(), "day");
      if (isPast && !hasHearingOnDate(date)) {
        return {
          style: {
            cursor: "not-allowed",
            backgroundColor: "#f5f5f5",
            color: "#9e9e9e",
            opacity: 0.6,
          },
        };
      }
      return { style: { cursor: "pointer" } };
    },
    [hasHearingOnDate]
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <FiCalendar className="h-8 w-8 text-black" />
            <div>
              <h1 className="text-3xl font-bold text-black">Hearings Calendar</h1>
              <p className="text-gray-700">
                Manage your upcoming hearings and schedules.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedHearing(null);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition-colors w-full md:w-auto"
          >
            <FiPlus /> Add Hearing
          </button>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border p-1 md:p-4 shadow-sm bg-white border-gray-300">
          <DnDCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={moveEvent}
            onEventResize={moveEvent}
            eventPropGetter={eventPropGetter}
            dayPropGetter={dayPropGetter}
            popup
            style={{ height: "75vh" }}
          />
        </div>

        {/* Form Modal */}
        <HearingForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          hearingData={selectedHearing}
          isEdit={!!selectedHearing?._id}
        />
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;
