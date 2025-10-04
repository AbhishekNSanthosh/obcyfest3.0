"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@lib/firebase"; // Adjust import path as needed

type Event = {
  id: string;
  title: string;
  image: string;
  regFinalDate: string;
  bgImage: string;
  featured?: boolean;
  RegCloseTime?: {
    hours: number;
    minutes: number;
  };
  regLink?: string;
  type: "technical" | "nonTechnical" | "sports";
  date?: string;
  description: string;
  venue?: string;
  eventType: string;
  memberMaxCount: number;
  memberMinCount: number;
  isOnline?: boolean;
  upi1?: string;
  upi2?: string;
  gpay?: string;
  maxParticipation?: string;
  minParticipation?: string;
  totalParticipation?: string;
  eveType?: "ind" | "team";
  registrationFee: string;
  firstPrize: string;
  secondPrize?: string;
  requiresExtraData?: boolean;
  extraFields?: { name: string; type: string }[];
  coordinators: { name: string; phone: string }[];
};

const defaultEvent: Event = {
  id: "",
  title: "",
  image: "",
  regFinalDate: "",
  bgImage: "",
  type: "technical",
  description: "",
  eventType: "",
  memberMaxCount: 0,
  memberMinCount: 0,
  registrationFee: "",
  firstPrize: "",
  coordinators: [],
};

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState<Event>(defaultEvent);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);

  // Fetch events from Firebase
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventsData: Event[] = [];
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() } as Event);
      });
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
      setMessage("Error fetching events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "memberMaxCount" || name === "memberMinCount") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (name.startsWith("RegCloseTime.")) {
      const field = name.split(".")[1] as "hours" | "minutes";
      setFormData((prev) => ({
        ...prev,
        RegCloseTime: {
          ...(prev.RegCloseTime || { hours: 0, minutes: 0 }),
          [field]: parseInt(value) || 0,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCoordinatorChange = (
    index: number,
    field: "name" | "phone",
    value: string
  ) => {
    const updatedCoordinators = [...formData.coordinators];
    updatedCoordinators[index] = {
      ...updatedCoordinators[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, coordinators: updatedCoordinators }));
  };

  const addCoordinator = () => {
    setFormData((prev) => ({
      ...prev,
      coordinators: [...prev.coordinators, { name: "", phone: "" }],
    }));
  };

  const removeCoordinator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      coordinators: prev.coordinators.filter((_, i) => i !== index),
    }));
  };

  const handleExtraFieldChange = (
    index: number,
    field: "name" | "type",
    value: string
  ) => {
    const updatedFields = [...(formData.extraFields || [])];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setFormData((prev) => ({ ...prev, extraFields: updatedFields }));
  };

  const addExtraField = () => {
    setFormData((prev) => ({
      ...prev,
      extraFields: [...(prev.extraFields || []), { name: "", type: "text" }],
    }));
  };

  const removeExtraField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extraFields: (prev.extraFields || []).filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === "imageFile") {
        setImageFile(files[0]);
      } else if (name === "bgImageFile") {
        setBgImageFile(files[0]);
      }
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env
        .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let updatedFormData = { ...formData };

      if (editingId) {
        // Update existing event
        const eventRef = doc(db, "events", editingId);
        await updateDoc(eventRef, formData);
        setMessage("Event updated successfully!");
      } else {
        // Add new event
        if (imageFile) {
          const imageUrl = await uploadToCloudinary(imageFile);
          updatedFormData.image = imageUrl;
        }
        if (bgImageFile) {
          const bgImageUrl = await uploadToCloudinary(bgImageFile);
          updatedFormData.bgImage = bgImageUrl;
        }

        await addDoc(collection(db, "events"), updatedFormData);
        setMessage("Event added successfully!");
      }

      setFormData(defaultEvent);
      setEditingId(null);
      setImageFile(null);
      setBgImageFile(null);
      // Reset file input fields
      (document.getElementById("imageFile") as HTMLInputElement).value = "";
      (document.getElementById("bgImageFile") as HTMLInputElement).value = "";
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      setMessage("Error saving event");
    } finally {
      setLoading(false);
    }
  };

  const editEvent = (event: Event) => {
    setFormData(event);
    setImageFile(null);
    setBgImageFile(null);
    setEditingId(event.id);
  };

  const deleteEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, "events", id));
        setMessage("Event deleted successfully!");
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        setMessage("Error deleting event");
      }
    }
  };

  const resetForm = () => {
    setFormData(defaultEvent);
    setEditingId(null);
    setImageFile(null);
    setBgImageFile(null);
    (document.getElementById("imageFile") as HTMLInputElement).value = "";
    (document.getElementById("bgImageFile") as HTMLInputElement).value = "";
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">
            Event Manager
          </h1>
          <p className="text-yellow-400">
            Add, edit, and manage events for Obcyfest
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.includes("Error") // Dark theme friendly alerts
                ? "bg-red-900/20 text-red-400 border border-red-500/30"
                : "bg-green-900/20 text-green-400 border border-green-500/30"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-black rounded-lg shadow-md p-6">
            <h2 className="text-xl text-yellow-400 font-semibold mb-4">
              {editingId ? "Edit Event" : "Add New Event"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="technical">Technical</option>
                    <option value="nonTechnical">Non-Technical</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Event Type
                  </label>
                  <input
                    type="text"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date || ""}
                    onChange={handleInputChange} // Dark theme input
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Registration Final Date
                  </label>
                  <input
                    type="text"
                    name="regFinalDate"
                    value={formData.regFinalDate}
                    onChange={handleInputChange} // Dark theme input
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Image URL
                  </label>
                  {editingId && formData.image && (
                    <img
                      src={formData.image}
                      alt="Current Event Image"
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <input
                    type="file"
                    name="imageFile"
                    id="imageFile"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-600"
                    required={!editingId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Background Image URL
                  </label>
                  {editingId && formData.bgImage && (
                    <img
                      src={formData.bgImage}
                      alt="Current Background Image"
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <input
                    type="file"
                    name="bgImageFile"
                    id="bgImageFile"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-600"
                    required={!editingId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue || ""}
                    onChange={handleInputChange} // Dark theme input
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Registration Fee
                  </label>
                  <input
                    type="text"
                    name="registrationFee"
                    value={formData.registrationFee}
                    onChange={handleInputChange} // Dark theme input
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    First Prize
                  </label>
                  <input
                    type="text"
                    name="firstPrize"
                    value={formData.firstPrize}
                    onChange={handleInputChange} // Dark theme input
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Second Prize
                  </label>
                  <input
                    type="text"
                    name="secondPrize"
                    value={formData.secondPrize || ""}
                    onChange={handleInputChange} // Dark theme input
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Min Participants
                  </label>
                  <input
                    type="number"
                    name="memberMinCount"
                    value={formData.memberMinCount}
                    onChange={handleInputChange} // Dark theme input
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="memberMaxCount"
                    value={formData.memberMaxCount}
                    onChange={handleInputChange} // Dark theme input
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus-ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Max Participation Text
                  </label>
                  <input
                    type="text"
                    name="maxParticipation"
                    value={formData.maxParticipation || ""}
                    onChange={handleInputChange} // Dark theme input
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-400 mb-1">
                    Min Participation Text
                  </label>
                  <input
                    type="text"
                    name="minParticipation"
                    value={formData.minParticipation || ""}
                    onChange={handleInputChange} // Dark theme input
                    className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured || false}
                    onChange={handleInputChange} // Themed checkbox
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-500 border-yellow-600 rounded bg-gray-800"
                  />
                  <label className="ml-2 block text-sm text-yellow-400">
                    Featured
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isOnline"
                    checked={formData.isOnline || false}
                    onChange={handleInputChange} // Themed checkbox
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-500 border-yellow-600 rounded bg-gray-800"
                  />
                  <label className="ml-2 block text-sm text-yellow-400">
                    Online Event
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requiresExtraData"
                    checked={formData.requiresExtraData || false}
                    onChange={handleInputChange} // Themed checkbox
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-500 border-yellow-600 rounded bg-gray-800"
                  />
                  <label className="ml-2 block text-sm text-yellow-400">
                    Requires Extra Data
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-400 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4} // Dark theme textarea
                  className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              {/* Registration Close Time */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">
                  Registration Close Time
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">
                      Hours
                    </label>
                    <input
                      type="number"
                      name="RegCloseTime.hours"
                      value={formData.RegCloseTime?.hours || ""}
                      onChange={handleInputChange} // Dark theme input
                      className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      min="0"
                      max="23"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">
                      Minutes
                    </label>
                    <input
                      type="number"
                      name="RegCloseTime.minutes"
                      value={formData.RegCloseTime?.minutes || ""}
                      onChange={handleInputChange} // Dark theme input
                      className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      min="0"
                      max="59"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">
                      UPI 1
                    </label>
                    <input
                      type="text"
                      name="upi1"
                      value={formData.upi1 || ""}
                      onChange={handleInputChange} // Dark theme input
                      className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">
                      UPI 2
                    </label>
                    <input
                      type="text"
                      name="upi2"
                      value={formData.upi2 || ""}
                      onChange={handleInputChange} // Dark theme input
                      className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">
                      Google Pay
                    </label>
                    <input
                      type="text"
                      name="gpay"
                      value={formData.gpay || ""}
                      onChange={handleInputChange} // Dark theme input
                      className="w-full px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
              </div>

              {/* Coordinators */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Coordinators</h3>
                  <button
                    type="button"
                    onClick={addCoordinator}
                    className="bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-semibold hover:bg-yellow-600"
                  >
                    Add Coordinator
                  </button>
                </div>
                {formData.coordinators.map((coordinator, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2"
                  >
                    <input
                      type="text"
                      placeholder="Name"
                      value={coordinator.name}
                      onChange={(e) =>
                        handleCoordinatorChange(index, "name", e.target.value)
                      }
                      className="px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Phone"
                        value={coordinator.phone}
                        onChange={(e) =>
                          handleCoordinatorChange(
                            index,
                            "phone",
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeCoordinator(index)}
                        className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra Fields */}
              {formData.requiresExtraData && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Extra Fields</h3>
                    <button
                      type="button"
                      onClick={addExtraField}
                      className="bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-semibold hover:bg-yellow-600"
                    >
                      Add Field
                    </button>
                  </div>
                  {(formData.extraFields || []).map((field, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2"
                    >
                      <input
                        type="text"
                        placeholder="Field Name"
                        value={field.name}
                        onChange={(e) =>
                          handleExtraFieldChange(index, "name", e.target.value)
                        }
                        className="px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      <div className="flex gap-2">
                        <select
                          value={field.type}
                          onChange={(e) =>
                            handleExtraFieldChange(
                              index,
                              "type",
                              e.target.value
                            )
                          }
                          className="flex-1 px-3 py-2 bg-gray-900 text-gray-200 border border-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="email">Email</option>
                          <option value="tel">Phone</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeExtraField(index)}
                          className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-yellow-500 text-black font-bold py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update Event"
                    : "Add Event"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Events List Section */}
          <div className="bg-black rounded-lg shadow-md p-6">
            <h2 className="text-xl text-yellow-400 font-semibold mb-4">
              Events ({events.length})
            </h2>

            <div className="space-y-4 max-h-[50rem] overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-yellow-600/30 rounded-lg p-4 hover:bg-gray-900/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        event.type === "technical"
                          ? "bg-blue-100 text-blue-800"
                          : event.type === "nonTechnical"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {event.type.replace(/([A-Z])/g, " $1")}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-2">
                    {event.description.substring(0, 100)}...
                  </p>

                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Date: {event.date}</span>
                    <span>Fee: {event.registrationFee}</span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => editEvent(event)}
                      className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-semibold hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {events.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No events found. Add your first event!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
