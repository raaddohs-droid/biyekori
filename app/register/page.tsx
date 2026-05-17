"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-red-700 mb-6">Create Account</h2>
        
        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Full Name" className="border rounded-lg px-4 py-3 w-full" />
          <input type="email" placeholder="Email" className="border rounded-lg px-4 py-3 w-full" />
          <input type="password" placeholder="Password" className="border rounded-lg px-4 py-3 w-full" />
          <select className="border rounded-lg px-4 py-3 w-full">
            <option>Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <input type="number" placeholder="Age" className="border rounded-lg px-4 py-3 w-full" />
          <input type="text" placeholder="City" className="border rounded-lg px-4 py-3 w-full" />
          <button className="bg-red-700 text-white py-3 rounded-full font-bold hover:bg-red-800">
            Register
          </button>
          <p className="text-center text-gray-500">Already have an account? 
            <Link href="/login" className="text-red-700 font-bold"> Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}