"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useApp } from "@/Context/Context.jsx";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ChangePassword = () => {
    const router = useRouter()
    const { token } = useParams();
    const { addAlert, userAuth } = useApp();
    const { updatePassword } = userAuth
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [loading, setLoading] = useState(false);

    const validatePassword = (password) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}|\\/<>,.+=_-]).{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword(newPass)) {
            addAlert({
                type: "error",
                message:
                    "Password must be at least 8 characters, include 1 lowercase, 1 uppercase, 1 digit, and 1 special character.",
            });
            return;
        }
        if (newPass !== confirmPass) {
            addAlert({ type: "error", message: "Passwords do not match." });
            return;
        }

        setLoading(true);
        try {
            const data = await updatePassword({ new_pass: newPass, token })
            addAlert(data)
            if (data.statusCode === 200) {
                setNewPass("");
                setConfirmPass("");
                router.push("/login")
            }
        } catch (err) {
            addAlert({ type: "error", message: "Server error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center mt-24 dark:bg-gray-900 p-4 overflow-hidden">
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-md sm:max-w-lg"
                aria-label="Change password form"
            >
                {/* Back button */}
                <Link href={"/"}>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        aria-label="Go back"
                    >
                        <FiArrowLeft className="text-lg" />
                        Back
                    </button>
                </Link>

                <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-gray-100">
                    Change Password
                </h2>

                <div className="mb-5">
                    <label
                        htmlFor="new-password"
                        className="block mb-2 font-medium text-gray-700 dark:text-gray-300"
                    >
                        New Password
                    </label>
                    <input
                        id="new-password"
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        required
                        aria-required="true"
                    />
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="confirm-password"
                        className="block mb-2 font-medium text-gray-700 dark:text-gray-300"
                    >
                        Confirm Password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        required
                        aria-required="true"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
                    aria-busy={loading}
                >
                    {loading ? "Changing..." : "Change Password"}
                </button>
            </form>
        </main>
    );
};

export default ChangePassword;
