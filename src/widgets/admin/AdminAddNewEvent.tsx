"use client";

import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@lib/firebase";
import { useRouter } from "next/navigation";
import Loader from "@components/Loader";
import { Event } from "@lib/types";
import { eventName } from "@utils/constants";
import { FaPlus, FaTrash } from "react-icons/fa";

const AddEvent = ({ eventId }: { eventId?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingEventIds, setExistingEventIds] = useState<string[]>([]);
  const router = useRouter();
  const isEditMode = !!eventId;

  const [formData, setFormData] = useState<Partial<Event>>({
    type: "nonTechnical",
    eveType: "ind",
    eventType: "Individual",
    isOnline: false,
    featured: false,
    requiresExtraData: false,
    coordinators: [{ name: "", phone: "" }],
    extraFields: [],
  });

  // Fetch existing event IDs and event data for edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all event IDs for uniqueness validation
        const snapshot = await getDocs(collection(db, "events"));
        setExistingEventIds(snapshot.docs.map((doc) => doc.id));

        // Fetch event data if in edit mode
        if (eventId) {
          const eventRef = doc(db, "events", eventId);
          const eventSnap = await getDoc(eventRef);
          if (eventSnap.exists()) {
            const eventData = eventSnap.data() as Event;
            setFormData({
              ...eventData,
              memberMaxCount: Number(eventData.memberMaxCount?.toString()),
              memberMinCount: Number(eventData.memberMinCount?.toString()),
            });
          } else {
            setError("Event not found.");
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data. Please try again.");
      }
    };
    fetchData();
  }, [eventId]);

  // Input change handler
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Checkbox handler
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
      ...(name === "requiresExtraData" && checked
        ? { extraFields: [{ name: "", type: "" }] }
        : name === "requiresExtraData" && !checked
        ? { extraFields: [] }
        : {}),
    }));
  };

  // Coordinator changes
  const handleCoordinatorChange = (
    index: number,
    field: "name" | "phone",
    value: string
  ) => {
    const coordinators = formData.coordinators
      ? [...formData.coordinators]
      : [];
    coordinators[index] = { ...coordinators[index], [field]: value };
    setFormData((prev) => ({ ...prev, coordinators }));
  };

  const addCoordinator = () => {
    setFormData((prev) => ({
      ...prev,
      coordinators: [...(prev.coordinators || []), { name: "", phone: "" }],
    }));
  };

  const removeCoordinator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      coordinators: (prev.coordinators || []).filter((_, i) => i !== index),
    }));
  };

  // Extra field changes
  const handleExtraFieldChange = (
    index: number,
    field: "name" | "type",
    value: string
  ) => {
    const extraFields = formData.extraFields ? [...formData.extraFields] : [];
    extraFields[index] = { ...extraFields[index], [field]: value };
    setFormData((prev) => ({ ...prev, extraFields }));
  };

  const addExtraField = () => {
    setFormData((prev) => ({
      ...prev,
      extraFields: [...(prev.extraFields || []), { name: "", type: "" }],
    }));
  };

  const removeExtraField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extraFields: (prev.extraFields || []).filter((_, i) => i !== index),
    }));
  };

  // Validate and open modal
  const openModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) {
      setError("Event ID is required.");
      return;
    }
    if (!isEditMode && existingEventIds.includes(formData.id)) {
      setError("Event ID must be unique.");
      return;
    }
    if (!formData.title) {
      setError("Title is required.");
      return;
    }
    if (!formData.description) {
      setError("Description is required.");
      return;
    }
    setError(null);
    setIsModalOpen(true);
  };

  // Add or update event
  const handleSubmitAction = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventRef = doc(db, "events", formData.id!);
      const updatedEvent: Event = {
        id: formData.id!,
        title: formData.title!,
        image: formData.image || "",
        bgImage: formData.bgImage || "",
        description: formData.description!,
        type: formData.type || "nonTechnical",
        eveType: formData.eveType || "ind",
        eventType: formData.eventType || "Individual",
        registrationFee: formData.registrationFee || "",
        firstPrize: formData.firstPrize || "",
        secondPrize: formData.secondPrize || "",
        venue: formData.venue || "",
        regFinalDate: formData.regFinalDate || "",
        date: formData.date || "",
        memberMaxCount: Number(formData.memberMaxCount) || 0,
        memberMinCount: Number(formData.memberMinCount) || 0,
        maxParticipation: formData.maxParticipation || "",
        minParticipation: formData.minParticipation || "",
        upi1: formData.upi1 || "",
        upi2: formData.upi2 || "",
        gpay: formData.gpay || "",
        RegCloseTime: formData.RegCloseTime || { hours: 0, minutes: 0 },
        coordinators: formData.coordinators || [],
        extraFields: formData.extraFields || [],
        isOnline: formData.isOnline || false,
        featured: formData.featured || false,
        requiresExtraData: formData.requiresExtraData || false,
      };
      await setDoc(eventRef, updatedEvent, { merge: true });
      setIsModalOpen(false);
      router.push("/admin/dashboard/events/addevent");
    } catch (err) {
      console.error(err);
      setError(
        `Failed to ${isEditMode ? "update" : "add"} event. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8 text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        {isEditMode ? "Edit Event" : "Add New Event"}
      </h1>
      <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-400 mb-4">
          {isEditMode
            ? `Edit Event for ${eventName}`
            : `Create New Event for ${eventName}`}
        </h2>
        <p className="text-gray-400 mb-6">
          {isEditMode
            ? `Edit event details for ${eventName}. Required fields are marked with *.`
            : `Add event details for ${eventName}. Required fields are marked with *.`}
        </p>

        <form className="space-y-4" onSubmit={openModal}>
          <Input
            label="Event ID"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            required
            disabled={isEditMode}
          />
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            placeholder="DD-MM-YYYY"
          />
          <Input
            label="Registration Final Date"
            name="regFinalDate"
            value={formData.regFinalDate}
            onChange={handleInputChange}
            placeholder="DD-MM-YYYY"
          />
          <Input
            label="Venue"
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
          />
          <Select
            label="Event Type"
            name="type"
            value={formData.type}
            options={[
              { label: "Technical", value: "technical" },
              { label: "Non-Technical", value: "nonTechnical" },
              { label: "Sports", value: "sports" },
            ]}
            onChange={handleInputChange}
          />
          <Select
            label="Event Category"
            name="eveType"
            value={formData.eveType}
            options={[
              { label: "Individual", value: "ind" },
              { label: "Team", value: "team" },
            ]}
            onChange={handleInputChange}
          />
          {formData.eveType === "team" && (
            <>
              <Input
                label="Maximum Members"
                name="memberMaxCount"
                type="number"
                value={formData.memberMaxCount || ""}
                onChange={handleInputChange}
              />
              <Input
                label="Minimum Members"
                name="memberMinCount"
                type="number"
                value={formData.memberMinCount || ""}
                onChange={handleInputChange}
              />
              <Input
                label="Maximum Participation"
                name="maxParticipation"
                value={formData.maxParticipation}
                onChange={handleInputChange}
              />
              <Input
                label="Minimum Participation"
                name="minParticipation"
                value={formData.minParticipation}
                onChange={handleInputChange}
              />
            </>
          )}
          <Input
            label="Registration Fee"
            name="registrationFee"
            value={formData.registrationFee}
            onChange={handleInputChange}
            placeholder="e.g., 100/-"
          />
          <Input
            label="First Prize"
            name="firstPrize"
            value={formData.firstPrize}
            onChange={handleInputChange}
          />
          <Input
            label="Second Prize"
            name="secondPrize"
            value={formData.secondPrize}
            onChange={handleInputChange}
          />
          <Input
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
          />
          <Input
            label="Background Image URL"
            name="bgImage"
            value={formData.bgImage}
            onChange={handleInputChange}
          />
          <Input
            label="UPI 1"
            name="upi1"
            value={formData.upi1}
            onChange={handleInputChange}
          />
          <Input
            label="UPI 2"
            name="upi2"
            value={formData.upi2}
            onChange={handleInputChange}
          />
          <Input
            label="GPay"
            name="gpay"
            value={formData.gpay}
            onChange={handleInputChange}
          />
          <div>
            <label className="block text-gray-300 mb-1">Coordinators</label>
            {(formData.coordinators || []).map((coord, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={coord.name}
                  onChange={(e) =>
                    handleCoordinatorChange(i, "name", e.target.value)
                  }
                  className="w-1/2 bg-gray-800 text-white rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
                  aria-label={`Coordinator ${i + 1} name`}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={coord.phone}
                  onChange={(e) =>
                    handleCoordinatorChange(i, "phone", e.target.value)
                  }
                  className="w-1/2 bg-gray-800 text-white rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
                  aria-label={`Coordinator ${i + 1} phone`}
                />
                <button
                  type="button"
                  onClick={() => removeCoordinator(i)}
                  className="p-2 bg-gray-800 text-red-400 rounded-md hover:bg-gray-700 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Remove coordinator ${i + 1}`}
                  disabled={(formData.coordinators?.length || 0) <= 1}
                >
                  <FaTrash className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCoordinator}
              className="text-sm text-yellow-400 hover:underline"
              aria-label="Add coordinator"
            >
              <FaPlus className="h-5 w-5 inline-block mr-1" />
              Add Coordinator
            </button>
          </div>
          {formData.requiresExtraData && (
            <div>
              <label className="block text-gray-300 mb-1">Extra Fields</label>
              {(formData.extraFields || []).map((field, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Field Name"
                    value={field.name}
                    onChange={(e) =>
                      handleExtraFieldChange(i, "name", e.target.value)
                    }
                    className="w-1/2 bg-gray-800 text-white rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
                    aria-label={`Extra field ${i + 1} name`}
                  />
                  <input
                    type="text"
                    placeholder="Field Type (text/number)"
                    value={field.type}
                    onChange={(e) =>
                      handleExtraFieldChange(i, "type", e.target.value)
                    }
                    className="w-1/2 bg-gray-800 text-white rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
                    aria-label={`Extra field ${i + 1} type`}
                  />
                  <button
                    type="button"
                    onClick={() => removeExtraField(i)}
                    className="p-2 bg-gray-800 text-red-400 rounded-md hover:bg-gray-700 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Remove extra field ${i + 1}`}
                    disabled={(formData.extraFields?.length || 0) <= 1}
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExtraField}
                className="text-sm text-yellow-400 hover:underline"
                aria-label="Add extra field"
              >
                <FaPlus className="h-5 w-5 inline-block mr-1" />
                Add Extra Field
              </button>
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-gray-300 mb-1">Options</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isOnline"
                  checked={formData.isOnline || false}
                  onChange={handleCheckboxChange}
                  className="bg-gray-800 text-yellow-400 rounded focus:ring-2 focus:ring-yellow-400"
                  aria-label="Online event checkbox"
                />
                Online Event
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured || false}
                  onChange={handleCheckboxChange}
                  className="bg-gray-800 text-yellow-400 rounded focus:ring-2 focus:ring-yellow-400"
                  aria-label="Featured event checkbox"
                />
                Featured Event
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="requiresExtraData"
                  checked={formData.requiresExtraData || false}
                  onChange={handleCheckboxChange}
                  className="bg-gray-800 text-yellow-400 rounded focus:ring-2 focus:ring-yellow-400"
                  aria-label="Requires extra data checkbox"
                />
                Requires Extra Data
              </label>
            </div>
          </div>
          {error && (
            <p className="mt-4 text-red-400 text-center" aria-live="assertive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard/events/addevent")}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              aria-label={
                isEditMode ? "Cancel editing event" : "Cancel adding event"
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-md hover:bg-yellow-500 disabled:opacity-50"
              disabled={loading}
              aria-label={isEditMode ? "Save event changes" : "Add new event"}
            >
              {loading ? (
                <Loader className="h-5 w-5" />
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Add Event"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 overflow-y-scroll bg-black/50 flex items-center justify-center z-50"
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
        >
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-yellow-400 mb-4"
            >
              {isEditMode ? "Confirm Edit Event" : "Confirm Add Event"}
            </h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to {isEditMode ? "edit" : "add"} the event "
              {formData.title}" with ID "{formData.id}"?
            </p>
            {loading ? (
              <div className="flex justify-center">
                <Loader className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex justify-end gap-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  aria-label={
                    isEditMode ? "Cancel editing event" : "Cancel adding event"
                  }
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAction}
                  className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-md hover:bg-yellow-500"
                  aria-label={
                    isEditMode
                      ? "Confirm editing event"
                      : "Confirm adding event"
                  }
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

// Reusable Input, TextArea, Select, and Checkbox components
const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  disabled,
}: any) => (
  <div>
    <label htmlFor={name} className="block text-gray-300 mb-1">
      {label}
      {required && <span className="text-red-400"> *</span>}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full bg-gray-800 text-white rounded-md p-2 focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
      aria-required={required}
      aria-label={label}
    />
  </div>
);

const TextArea = ({ label, name, value, onChange, required }: any) => (
  <div>
    <label htmlFor={name} className="block text-gray-300 mb-1">
      {label}
      {required && <span className="text-red-400"> *</span>}
    </label>
    <textarea
      name={name}
      id={name}
      value={value || ""}
      onChange={onChange}
      rows={4}
      required={required}
      className="w-full bg-gray-800 text-white rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
      aria-required={required}
      aria-label={label}
    />
  </div>
);

const Select = ({ label, name, value, options, onChange }: any) => (
  <div>
    <label htmlFor={name} className="block text-gray-300 mb-1">
      {label}
    </label>
    <select
      name={name}
      id={name}
      value={value || options[0].value}
      onChange={onChange}
      className="w-full bg-gray-800 text-white rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
      aria-label={label}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default AddEvent;
