"use client"
import React from 'react'
import { FiArrowLeft } from "react-icons/fi"
import { useRouter } from "next/navigation"

const ForgetPass = ({ email = "" }) => {
    const router = useRouter()
    return (
        <div className="mx-auto max-w-md px-4 py-12">
            <button
                onClick={() => router.back()}
                className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:underline dark:text-zinc-400"
            >
                <FiArrowLeft /> Back
            </button>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h1 className="mb-2 text-xl font-semibold">Password Reset</h1>
                {email ? (
                    <>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            We will send an email to this address: <span className="font-medium">{email}</span>.
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                            Please verify it and reset the password.
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-rose-600">Email is required.</p>
                )}
            </div>
        </div>
    )
}

export default ForgetPass
