import ProfileCard from "@/components/profiles/ProfileCard";

export default function TestProfiles() {
  const profile1 = {
    id: "1",
    lookingFor: "bride" as const,
    full_name: "Ayesha Rahman",
    age: 26,
    height: "5'4\"",
    location: "Dhaka",
    education: "MBA",
    profession: "Bank Officer",
    monthlyIncome: 45000,
    religion: "Islam",
    maritalStatus: "Never married",
    isVerified: true,
    isPremium: true,
    isPhotoVisible: false,
    lastActive: "Active 2h ago",
    managedBy: "Parents",
    familyType: "Nuclear",
    religiousPractice: "Religious"
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Profile Cards</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <ProfileCard profile={profile1} />
      </div>
    </div>
  );
}