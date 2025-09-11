"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/Context/Context.jsx";
import { FiX, FiLoader, FiUpload, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import "react-phone-number-input/style.css"

const ProfileForm = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [formLoading, setFormLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { userData, setUserData, addAlert, userAuth, userImage, userProfile } = useApp();
  const user = userData;
  const { updateAvatar, editProfile } = userAuth;
  const { image, setImage } = userImage;
  const { setIsEditProfile } = userProfile;
  const [avatarUpdated, setAvatarUpdated] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    userName: "",
    phoneNumber: "",
    address: "",
    totalLawyer: 1
  });

  // Prefill form
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user?.fullName || "",
        email: user?.email || "",
        userName: user?.userName || "",
        phoneNumber: user?.phoneNumber || "",
        address: user?.address || "",
      });
    }
    if (user?.role === "Law Firm") {
      setFormData({
        fullName: user?.fullName || "",
        email: user?.email || "",
        userName: user?.userName || "",
        phoneNumber: user?.phoneNumber || "",
        address: user?.address || "",
        totalLawyer: user?.totalLawyer || 1
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUpdated(false);
    }
  };

  const handleChangeAvatar = async () => {
    if (!avatarFile) return;
    try {
      setAvatarLoading(true);
      const data = await updateAvatar(avatarFile);
      addAlert(data);
      if (data.statusCode === 200) {
        setImage(data?.data || null);
        setAvatarUpdated(true);
      }
    } catch (error) {
      addAlert("error", "Internal server error during avatar update");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phoneNumber: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
      return addAlert({ type: "error", message: "Invalid phone number!" })
    }
    setFormLoading(true);
    try {
      const payload = { ...formData };
      const data = await editProfile({ userData: payload });
      addAlert(data);
      if (data.statusCode === 201) {
        localStorage.setItem("email", payload.email);
        setIsEditProfile(true);
        router.push("/email-verify");
      }
      if (data.statusCode === 200) {
        setUserData(data.data);
      }
    } catch (error) {
      addAlert("error", "Internal server error during profile update");
    } finally {
      setFormLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4 overflow-auto">
      <div className="w-full max-w-2xl rounded-2xl shadow-xl p-6 bg-white border border-black max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-black pb-3">
          <h2 className="text-xl font-semibold text-black">Edit Profile</h2>
          <button onClick={onClose} className="text-black hover:text-gray-700 transition">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {user?.avatar || image ? (
                <img
                  src={image || user?.avatar?.avatarUrl || "/placeholder.svg"}
                  alt="Avatar preview"
                  className="h-24 w-24 rounded-full object-cover border-4 border-black"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-4 border-black flex items-center justify-center bg-gray-100">
                  <FiUser className="h-8 w-8 text-gray-700" />
                </div>
              )}

              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 h-8 w-8 bg-black text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition"
              >
                <FiUpload className="h-4 w-4" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {avatarFile && (
              <p className="text-sm text-black">
                Selected: <span className="font-medium">{avatarFile.name}</span>
              </p>
            )}

            <button
              type="button"
              onClick={handleChangeAvatar}
              disabled={!avatarFile || avatarLoading || avatarUpdated}
              className="px-4 py-1 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {avatarLoading && <FiLoader className="animate-spin text-sm" />}
              {avatarLoading ? "Uploading..." : avatarUpdated ? "Updated ✅" : "Update Avatar"}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Click the icon to choose a file, then update your avatar
            </p>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Username <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
              <PhoneInput
                international
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Role</label>
              <input
                type="text"
                value={user?.role || ""}
                disabled
                className="w-full px-3 py-2 border border-black rounded-lg text-gray-500 bg-gray-100 cursor-not-allowed"
                placeholder="Role (cannot be changed)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Total Lawyer</label>
            <input
              type="number"
              name="totalLawyer"
              value={formData.totalLawyer}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
              placeholder="Enter your Curent Lawyer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
              placeholder="Enter your address"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black hover:text-gray-700 transition rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
            >
              {formLoading && <FiLoader className="animate-spin text-sm" />}
              {formLoading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
