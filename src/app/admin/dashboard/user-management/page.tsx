'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from "@lib/firebase";

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

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, { role: newRole });
    setUsers(users.map(user => (user.id === userId ? { ...user, role: newRole } : user)));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">User Management</h1>
      <div className="overflow-x-auto rounded-lg shadow border border-yellow-400/30">
        <table className="min-w-full divide-y divide-yellow-400/30 bg-black-950 text-white">
          <thead className="bg-black-900 text-yellow-400">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase">Name</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase">Email</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase">Class</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase">Phone</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase">Role</th>
              <th className="py-3 px-6 text-left text-sm font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-400/20">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-yellow-400/10 transition-colors">
                <td className="py-3 px-6">{user.displayName}</td>
                <td className="py-3 px-6">{user.email}</td>
                <td className="py-3 px-6">S{user.semester}</td>
                <td className="py-3 px-6">{user.phone}</td>
                <td className="py-3 px-6 capitalize">{user.role}</td>
                <td className="py-3 px-6">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="bg-black-900 border border-yellow-400/40 text-yellow-400 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
