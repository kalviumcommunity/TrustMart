"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

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
      fetchUser();
    } catch (error) {
      console.error("Invalid token:", error);
      router.push("/login");
    }
  }, [router, userId]);

  const fetchUser = async () => {
    try {
      // Mock user data - in production, this would be an API call
      const mockUsers: User[] = [
        { id: 1, name: "Alice Johnson", email: "alice@example.com", age: 25, role: "user", isActive: true },
        { id: 2, name: "Bob Smith", email: "bob@example.com", age: 30, role: "admin", isActive: true },
        { id: 3, name: "Charlie Brown", email: "charlie@example.com", age: 28, role: "user", isActive: false },
      ];

      const foundUser = mockUsers.find(u => u.id === parseInt(userId));
      
      if (foundUser) {
        setUser(foundUser);
      } else {
        setError("User not found");
      }
    } catch (error) {
      setError("Failed to fetch user data");
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
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The user you're looking for doesn't exist."}</p>
          <a
            href="/users"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Users
          </a>
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
              <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage user information
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

        {/* User Profile Card */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.isActive)}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                  <p className="mt-1 text-sm text-gray-500">User ID: #{user.id}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Age</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.age} years old</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                  <dd className="mt-1">
                    {getStatusBadge(user.isActive)}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1">
                    {getRoleBadge(user.role)}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="flex space-x-4">
                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send Message
                </button>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Deactivate
                </button>
              </div>
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
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-900">
                    {user.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </main>
  );
}
