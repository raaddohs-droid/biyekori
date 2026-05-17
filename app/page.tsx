"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const en = {
    tagline: "Find Your Life Partner",
    sub: "Bangladesh's most trusted matrimony platform",
    start: "Get Started",
    login: "Login",
    register: "Register",
    profiles: "Profiles",
    home: "Home",
    logout: "Logout",
    create: "Create Profile",
    createSub: "Set up your profile and find matches",
    search: "Search Profiles",
    searchSub: "Filter by age, location, religion and more",
    interest: "Send Interest",
    interestSub: "Connect with your perfect match",
    footer: "Bangladesh Trusted Matrimony Platform",
    stats1: "10,000+ Profiles",
    stats2: "5,000+ Matches",
    stats3: "2,000+ Marriages",
  };

  const bn = {
    tagline: "আপনার জীবনসঙ্গী খুঁজুন",
    sub: "বাংলাদেশের সবচেয়ে বিশ্বস্ত বিবাহ প্ল্যাটফর্ম",
    start: "শুরু করুন",
    login: "লগইন",
    register: "নিবন্ধন",
    profiles: "প্রোফাইল",
    home: "হোম",
    logout: "লগআউট",
    create: "প্রোফাইল তৈরি করুন",
    createSub: "আপনার প্রোফাইল সেট আপ করুন",
    search: "প্রোফাইল খুঁজুন",
    searchSub: "বয়স, অবস্থান, ধর্ম দিয়ে ফিল্টার করুন",
    interest: "আগ্রহ পাঠান",
    interestSub: "আপনার নিখুঁত সঙ্গীর সাথে সংযোগ করুন",
    footer: "বাংলাদেশের বিশ্বস্ত বিবাহ প্ল্যাটফর্ম",
    stats1: "১০,০০০+ প্রোফাইল",
    stats2: "৫,০০০+ ম্যাচ",
    stats3: "২,০০০+ বিবাহ",
  };

  const text = lang === "en" ? en : bn;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen font-sans bg-white">
      <header className="text-white py-4 px-8 flex justify-between items-center shadow-lg bg-red-800">
        <Link href="/" className="text-2xl font-bold">
          💍 BandhanBD
        </Link>
        <nav className="flex gap-6 items-center">
          <Link href="/" className="hover:underline">{text.home}</Link>
          <Link href="/profiles" className="hover:underline">{text.profiles}</Link>
          {user ? (
            <>
              <span className="bg-white text-red-700 px-3 py-1 rounded-full font-bold text-sm">
                👤 {user.user_metadata?.full_name || user.email}
              </span>
              <button onClick={handleLogout} className="hover:underline">{text.logout}</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">{text.login}</Link>
              <Link href="/register" className="bg-white text-red-700 px-4 py-2 rounded-full font-bold hover:bg-red-50">{text.register}</Link>
            </>
          )}
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="bg-white text-red-700 px-3 py-1 rounded-full font-bold text-sm hover:bg-red-50"
          >
            {lang === "en" ? "বাং" : "EN"}
          </button>
        </nav>
      </header>

      <section className="text-center py-24 px-8 text-white bg-red-700">
        <h2 className="text-5xl font-bold mb-4">{text.tagline}</h2>
        <p className="text-xl mb-8 text-red-100">{text.sub}</p>
        <Link href="/register" className="bg-white text-red-700 font-bold px-10 py-4 rounded-full text-lg hover:bg-red-50 shadow-lg">
          {text.start} →
        </Link>
      </section>

      <section className="py-10 px-8 grid grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
        {[text.stats1, text.stats2, text.stats3].map((stat, i) => (
          <div key={i} className="bg-red-700 text-white rounded-2xl p-6 shadow">
            <p className="text-2xl font-bold">{stat}</p>
          </div>
        ))}
      </section>

      <section className="py-10 px-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[
          { icon: "👤", title: text.create, sub: text.createSub, link: "/register" },
          { icon: "🔍", title: text.search, sub: text.searchSub, link: "/profiles" },
          { icon: "💌", title: text.interest, sub: text.interestSub, link: "/login" },
        ].map((f, i) => (
          <Link href={f.link} key={i} className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all border border-red-100">
            <div className="text-5xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-bold mb-2 text-red-700">{f.title}</h3>
            <p className="text-gray-500">{f.sub}</p>
          </Link>
        ))}
      </section>

      <footer className="bg-red-800 text-white text-center py-8 mt-8">
        <p className="text-lg font-bold">💍 BandhanBD</p>
        <p className="text-red-200 text-sm mt-1">{text.footer}</p>
        <p className="text-red-300 text-xs mt-2">© 2026 BandhanBD. All rights reserved.</p>
      </footer>
    </div>
  );
}