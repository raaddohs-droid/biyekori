"use client";
import { useState } from "react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 font-bold rounded-l-full ${isLogin ? "bg-red-700 text-white" : "bg-gray-100 text-gray-500"}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 font-bold rounded-r-full ${!isLogin ? "bg-red-700 text-white" : "bg-gray-100 text-gray-500"}`}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center text-red-700">Welcome Back</h2>
            <input type="email" placeholder="Email" className="border rounded-lg px-4 py-3 w-full" />
            <input type="password" placeholder="Password" className="border rounded-lg px-4 py-3 w-full" />
            <button className="bg-red-700 text-white py-3 rounded-full font-bold hover:bg-red-800">Login</button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center text-red-700">Create Account</h2>
            <input type="text" placeholder="Full Name" className="border rounded-lg px-4 py-3 w-full" />
            <input type="email" placeholder="Email" className="border rounded-lg px-4 py-3 w-full" />
            <input type="password" placeholder="Password" className="border rounded-lg px-4 py-3 w-full" />
            <button className="bg-red-700 text-white py-3 rounded-full font-bold hover:bg-red-800">Register</button>
          </div>
        )}
      </div>
    </div>
  );
}