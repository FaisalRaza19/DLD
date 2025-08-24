"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/Context/Context.jsx";
import { FiX, FiLoader, FiUpload, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";

const ProfileForm = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [formLoading, setFormLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { userData, setUserData, addAlert, theme, userAuth, userImage, userProfile } = useApp();
  const user = userData;
  const { updateAvatar, editProfile } = userAuth;
  const { image, setImage } = userImage;
  const { setIsEditProfile } = userProfile
  const [avatarUpdated, setAvatarUpdated] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    userName: "",
    phoneNumber: "",
    address: "",
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

  // change avatar in db
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
      addAlert("error", "Internal server error during edit profile" || error.message)
    } finally {
      setAvatarLoading(false);
    }
  };


  // submit profile form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...formData };
      const data = await editProfile({ userData: payload });
      addAlert(data);
      if (data.statusCode === 201) {
        localStorage.setItem("email", payload.email);
        setIsEditProfile(true)
        router.push("/email-verify");
      }
      if (data.statusCode === 200) {
        setUserData(data.data)
      }
    } catch (error) {
      addAlert("error", "Internal server error during edit profile" || error.message)
    } finally {
      setFormLoading(false);
    }
  };

  if (!isOpen) return null;

  // Theme classes
  const bg = theme === "light" ? "bg-white" : "bg-gray-800";
  const border = theme === "light" ? "border-gray-200" : "border-gray-700";
  const inputBg = theme === "light" ? "bg-white" : "bg-gray-700";
  const inputText = theme === "light" ? "text-gray-900" : "text-gray-100";
  const mutedText = theme === "light" ? "text-gray-500" : "text-gray-400";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${bg} border ${border} shadow-xl`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${border}`}>
          <h2 className={`text-xl font-semibold ${inputText}`}>Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className={`${mutedText} hover:${inputText} transition-colors`}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Upload */}
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {user?.avatar || image ? (
                <img
                  src={image || user?.avatar?.avatarUrl || "/placeholder.svg"}
                  alt="Avatar preview"
                  className={`h-24 w-24 rounded-full object-cover border-4 ${border}`}
                />
              ) : (
                <div
                  className={`h-24 w-24 rounded-full ${inputBg} border-4 ${border} flex items-center justify-center`}
                >
                  <FiUser className={`h-8 w-8 ${mutedText}`} />
                </div>
              )}

              {/* Upload Icon */}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
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

            {/* File name display */}
            {avatarFile && (
              <p className={`text-sm ${inputText}`}>
                Selected: <span className="font-medium">{avatarFile.name}</span>
              </p>
            )}

            {/* Update Button */}
            <button
              type="button"
              onClick={handleChangeAvatar}
              disabled={!avatarFile || avatarLoading || avatarUpdated}
              className="px-4 py-1 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {avatarLoading && <FiLoader className="animate-spin text-sm" />}
              {avatarLoading ? "Uploading..." : avatarUpdated ? "Updated ✅" : "Update Avatar"}
            </button>

            <p className={`text-sm ${mutedText}`}>
              Click the icon to choose a file, then update your avatar
            </p>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={`block text-sm font-medium ${inputText} mb-2`}>
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 ${inputBg} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${inputText}`}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${inputText} mb-2`}>
                Username <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 ${inputBg} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${inputText}`}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${inputText} mb-2`}>
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 ${inputBg} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${inputText}`}
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${inputText} mb-2`}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 ${inputBg} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${inputText}`}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${inputText} mb-2`}>
                Role
              </label>
              <input
                type="text"
                value={user?.role || ""}
                disabled
                className={`w-full px-3 py-2 ${inputBg} border ${border} rounded-lg text-muted-foreground cursor-not-allowed`}
                placeholder="Role (cannot be changed)"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${inputText} mb-2`}>
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 ${inputBg} border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${inputText}`}
              placeholder="Enter your address"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 ${mutedText} hover:${inputText} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
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
