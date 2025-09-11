"use client";
import { useState } from "react";
import { useApp } from "@/Context/Context.jsx";
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx";
import ProfileForm from "./ProfileForm.jsx";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit,
  FiShield,
  FiBell,
} from "react-icons/fi";
import { formatDate } from "@/Components/formatDate.js";

const Settings = () => {
  const { userData, addAlert, userImage } = useApp();
  const user = userData;
  const { image } = userImage;

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const handleNotificationChange = (type) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
    addAlert({ type: "success", message: "Notification preferences updated" });
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-8 min-h-screen bg-white text-black">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Info + Notifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <div className="rounded-lg border border-black p-5 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg md:text-xl font-semibold">
                  Profile Information
                </h2>
                <button
                  onClick={() => setShowProfileForm(true)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition text-sm md:text-base"
                >
                  <FiEdit className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {image || user?.avatar ? (
                    <img
                      src={
                        image ||
                        user?.avatar?.avatarUrl ||
                        "/placeholder.svg"
                      }
                      alt={user?.fullName}
                      className="h-20 w-20 rounded-full object-cover border-4 border-black"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold border-4 border-black bg-gray-100 text-gray-700">
                      {getInitials(user?.fullName)}
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileItem
                      icon={FiUser}
                      label="Full Name"
                      value={user?.fullName}
                    />
                    <ProfileItem
                      icon={FiMail}
                      label="Email"
                      value={user?.email}
                    />
                    <ProfileItem
                      icon={FiPhone}
                      label="Phone"
                      value={user?.phoneNumber}
                    />
                    <ProfileItem
                      icon={FiShield}
                      label="Role"
                      value={user?.role}
                      capitalize
                    />
                  </div>

                  {user?.address && (
                    <ProfileItem
                      icon={FiMapPin}
                      label="Address"
                      value={user?.address}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="rounded-lg border border-black p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <NotificationItem
                  icon={FiMail}
                  label="Email Notifications"
                  description="Receive notifications via email"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange("email")}
                />
                <NotificationItem
                  icon={FiBell}
                  label="Push Notifications"
                  description="Receive push notifications in browser"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange("push")}
                />
                <NotificationItem
                  icon={FiPhone}
                  label="SMS Notifications"
                  description="Receive notifications via SMS"
                  checked={notifications.sms}
                  onChange={() => handleNotificationChange("sms")}
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="rounded-lg border border-black p-5 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-4">
              Account Information
            </h3>
            <div className="space-y-3 text-sm md:text-base">
              <InfoRow
                label="Account ID"
                value={`#${user?._id || "N/A"}`}
              />
              <InfoRow
                label="Member Since"
                value={formatDate(user?.createdAt) || "N/A"}
              />
              <InfoRow
                label="Last Login"
                value={formatDate(user?.updatedAt) || "Today"}
              />
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <ProfileForm
          isOpen={showProfileForm}
          onClose={() => setShowProfileForm(false)}
        />
      </div>
    </DashboardLayout>
  );
};

// ======= Reusable Components =======

const ProfileItem = ({ icon: Icon, label, value, capitalize }) => (
  <div className="flex items-center gap-3 break-words">
    <Icon className="h-5 w-5 text-gray-500 mt-0.5" />
    <div className="overflow-hidden">
      <p className="text-xs md:text-sm text-gray-500">{label}</p>
      <p
        className={`text-sm md:text-base font-medium text-black truncate ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

const NotificationItem = ({ icon: Icon, label, description, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-gray-500" />
      <div>
        <p className="text-sm md:text-base font-medium text-black">{label}</p>
        <p className="text-xs md:text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-black" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-xs md:text-sm text-gray-500">{label}</span>
    <span className="text-xs md:text-sm text-black break-words">{value}</span>
  </div>
);

export default Settings;
