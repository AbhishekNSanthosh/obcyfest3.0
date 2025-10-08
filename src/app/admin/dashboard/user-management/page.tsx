'use client';

import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@lib/firebase";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  semester: string;
  role: string;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof User>("displayName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as User)
        );
        setUsers(usersList);
      } catch (error) {
        toast.error("Failed to fetch users");
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, { role: newRole });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
      console.error("Error updating role:", error);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter((user) => user.id !== userId));
        // Adjust current page if necessary
        if (currentUsers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error("Failed to delete user");
        console.error("Error deleting user:", error);
      }
    }
  };

  // Search and filter users
  const filteredUsers = useMemo(() => {
    // Normalize search term for case-insensitive search
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    let result = users.filter((user) => {
      // Handle null/undefined fields gracefully
      const displayName = user.displayName
        ? user.displayName.toLowerCase()
        : "";
      const email = user.email ? user.email.toLowerCase() : "";

      return (
        (displayName.includes(normalizedSearchTerm) ||
          email.includes(normalizedSearchTerm)) &&
        (roleFilter === "all" || user.role === roleFilter)
      );
    });

    // Sort users
    return result.sort((a, b) => {
      const aValue = a[sortField] || ""; // Handle null/undefined fields
      const bValue = b[sortField] || "";
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, searchTerm, roleFilter, sortField, sortOrder]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle sorting
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-yellow-400 mb-4 text-center">
          Obcyfest 4.0 User Management
        </h1>

        {/* Total Users Display */}
        <div className="mb-6 bg-gray-900 p-4 rounded-xl border border-yellow-400/30 text-white flex justify-between items-center">
          <p className="text-lg font-medium">
            Total Users: <span className="text-yellow-400">{users.length}</span>
          </p>
          <p className="text-lg font-medium">
            Filtered Users:{" "}
            <span className="text-yellow-400">{filteredUsers.length}</span>
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full px-4 py-2 bg-gray-800 border border-yellow-400/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            className="px-4 py-2 bg-gray-800 border border-yellow-400/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-lg border border-yellow-400/30">
          <table className="min-w-full divide-y divide-yellow-400/30 bg-gray-950 text-white">
            <thead className="bg-gray-900 text-yellow-400">
              <tr>
                {(
                  [
                    "displayName",
                    "email",
                    "semester",
                    "phone",
                    "role",
                  ] as (keyof User)[]
                ).map((field) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="py-4 px-6 text-left text-sm font-semibold uppercase cursor-pointer hover:bg-yellow-400/20 transition-colors"
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {sortField === field && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                ))}
                <th className="py-4 px-6 text-left text-sm font-semibold uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-400/20">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 px-6 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 px-6 text-center text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-yellow-400/10 transition-colors"
                  >
                    <td className="py-4 px-6">{user.displayName || "N/A"}</td>
                    <td className="py-4 px-6">{user.email || "N/A"}</td>
                    <td className="py-4 px-6">S{user.semester || "N/A"}</td>
                    <td className="py-4 px-6">{user.phone || "N/A"}</td>
                    <td className="py-4 px-6 capitalize">
                      {user.role || "User"}
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="bg-gray-800 border border-yellow-400/40 text-yellow-400 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="guest">Guest</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4 bg-gray-900 p-4 rounded-xl border border-yellow-400/30">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg disabled:bg-gray-600 disabled:text-gray-400 hover:bg-yellow-500 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {totalPages <= 5 ? (
                Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === page
                          ? "bg-yellow-400 text-black"
                          : "bg-gray-800 text-yellow-400"
                      } hover:bg-yellow-400/80 transition-colors`}
                    >
                      {page}
                    </button>
                  )
                )
              ) : (
                <>
                  <button
                    onClick={() => paginate(1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === 1
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-800 text-yellow-400"
                    } hover:bg-yellow-400/80 transition-colors`}
                  >
                    1
                  </button>
                  {currentPage > 3 && (
                    <span className="text-yellow-400">...</span>
                  )}
                  {Array.from({ length: 3 }, (_, i) => {
                    const page =
                      currentPage <= 3
                        ? i + 2
                        : currentPage > totalPages - 3
                        ? totalPages - 3 + i
                        : currentPage - 1 + i;
                    return page < totalPages && page > 1 ? (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentPage === page
                            ? "bg-yellow-400 text-black"
                            : "bg-gray-800 text-yellow-400"
                        } hover:bg-yellow-400/80 transition-colors`}
                      >
                        {page}
                      </button>
                    ) : null;
                  })}
                  {currentPage < totalPages - 2 && (
                    <span className="text-yellow-400">...</span>
                  )}
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-800 text-yellow-400"
                    } hover:bg-yellow-400/80 transition-colors`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg disabled:bg-gray-600 disabled:text-gray-400 hover:bg-yellow-500 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;