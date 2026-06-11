content = open('app/profile/[id]/ProfilePageClient.tsx', 'r', encoding='utf-8').read()

# Add import
old_import = "import Link from 'next/link'"
new_import = "import Link from 'next/link'\nimport dynamic from 'next/dynamic'\nconst MatchComparison = dynamic(() => import('@/components/MatchComparison'), { ssr: false })"
content = content.replace(old_import, new_import, 1)

# Add viewerProfile state
old_state = "  const [showModal, setShowModal] = useState(false)"
new_state = "  const [showModal, setShowModal] = useState(false)\n  const [viewerProfile, setViewerProfile] = useState<any>(null)"
content = content.replace(old_state, new_state, 1)

# Fetch viewer profile in useEffect
old_effect = "    // Check if interest already sent"
new_effect = """    // Fetch viewer's own profile for match comparison
    if (userData) {
      const u = JSON.parse(userData)
      fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${u.id}&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      }).then(r => r.json()).then(data => {
        if (Array.isArray(data) && data[0]) setViewerProfile(data[0])
      }).catch(() => {})
    }

    // Check if interest already sent"""
content = content.replace(old_effect, new_effect, 1)

# Add MatchComparison component after the AI score card
old_place = "        {showModal && <ScoreModal"
new_place = "        {isLoggedIn && viewerProfile && <MatchComparison profile={profile} viewerProfile={viewerProfile} />}\n\n        {showModal && <ScoreModal"
content = content.replace(old_place, new_place, 1)

open('app/profile/[id]/ProfilePageClient.tsx', 'w', encoding='utf-8', newline='\n').write(content)
print('Done')
