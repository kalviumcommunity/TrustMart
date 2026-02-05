"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser(payload);
      fetchUsers();
    } catch (error) {
      console.error("Invalid token:", error);
      router.push("/login");
    }
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users || []);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  const getStatusBadge = (isActive: boolean) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? "bg-green-100 text-green-800" 
        : "bg-red-100 text-red-800"
    }`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      moderator: "bg-blue-100 text-blue-800",
      user: "bg-gray-100 text-gray-800",
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || colors.user}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage all users in the system
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Logged in as: <span className="font-medium capitalize">{currentUser?.role}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                All Users ({users.length})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                List of all registered users in the system.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                {users.length === 0 ? (
                  <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                    No users found.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <div key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                {getRoleBadge(user.role)}
                              </div>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-900">Age: {user.age}</p>
                              {getStatusBadge(user.isActive)}
                            </div>
                            <a
                              href={`/users/${user.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Profile →
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-6 sm:px-0">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <a href="/users" className="ml-4 text-sm font-medium text-gray-900">
                    Users
                  </a>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </main>
  );
}
