"use client";

import React, { useState } from "react";
import { collection, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@lib/firebase";
import { useRouter } from "next/navigation";
import Loader from "@components/Loader";

const SettingsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle delete operations
  const handleDeleteAction = async () => {
    setLoading(true);
    setError(null);
    try {
      if (actionType === "users" || actionType === "reset-all") {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const deleteUsers = usersSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deleteUsers);
      }
      if (actionType === "registrations" || actionType === "reset-all") {
        const registrationsSnapshot = await getDocs(
          collection(db, "registrations")
        );
        const deleteRegistrations = registrationsSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deleteRegistrations);
      }
      if (actionType === "scoreboard" || actionType === "reset-all") {
        const scoreboardSnapshot = await getDocs(collection(db, "score"));
        const deleteScoreboard = scoreboardSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deleteScoreboard);
      }
      setIsModalOpen(false);
      router.refresh(); // Refresh to reflect changes
    } catch (err) {
      setError("Failed to perform action. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation modal
  const openModal = (type: string) => {
    setActionType(type);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setActionType(null);
    setError(null);
  };

  // Modal messages based on action type
  const getModalMessage = () => {
    switch (actionType) {
      case "users":
        return "Are you sure you want to delete all users? This action cannot be undone.";
      case "registrations":
        return "Are you sure you want to delete all registrations? This action cannot be undone.";
      case "scoreboard":
        return "Are you sure you want to delete all scoreboard data? This action cannot be undone.";
      case "reset-all":
        return "Are you sure you want to reset all data (users, registrations, and scoreboard)? This action cannot be undone.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8 text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Settings</h1>
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            Danger Zone
          </h2>
          <p className="text-gray-400 mb-6">
            These actions are destructive and cannot be undone. Proceed with
            caution.
          </p>

          {/* Delete All Users */}
          <div className="mb-4">
            <button
              onClick={() => openModal("users")}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              disabled={loading}
              aria-label="Delete all users"
            >
              Delete All Users
            </button>
          </div>

          {/* Delete All Registrations */}
          <div className="mb-4">
            <button
              onClick={() => openModal("registrations")}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              disabled={loading}
              aria-label="Delete all registrations"
            >
              Delete All Registrations
            </button>
          </div>

          {/* Delete All Scoreboard */}
          <div className="mb-4">
            <button
              onClick={() => openModal("scoreboard")}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              disabled={loading}
              aria-label="Delete all scoreboard data"
            >
              Delete All Scoreboard Data
            </button>
          </div>

          {/* Reset All */}
          <div>
            <button
              onClick={() => openModal("reset-all")}
              className="w-full bg-red-800 text-white py-2 px-4 rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              disabled={loading}
              aria-label="Reset all data"
            >
              Reset All Data
            </button>
          </div>

          {error && (
            <p className="mt-4 text-red-400 text-center" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 transform transition-transform duration-300 scale-100">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">
              Confirm Action
            </h2>
            <p className="text-gray-300 mb-6">{getModalMessage()}</p>
            {loading ? (
              <div className="flex justify-center">
                <Loader />
              </div>
            ) : (
              <div className="flex justify-end gap-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  aria-label="Cancel action"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAction}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  aria-label="Confirm action"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
