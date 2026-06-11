import urllib.request

# Fetch from the last known good commit 07bceed
url = 'https://raw.githubusercontent.com/raaddohs-droid/biyekori/07bceed/components/Navbar.tsx'
content = urllib.request.urlopen(url).read().decode('utf-8')

# Now add clickable notifications cleanly
old = """                    ) : notifs.map((n: any, i: number) => (
                      <div key={n.id || i} style={{
                        padding: '12px 16px', borderBottom: '1px solid #f9fafb',
                        background: n.is_read ? 'white' : '#fef2f8',
                        display: 'flex', gap: '10px', alignItems: 'flex-start'
                      }}>
                        <span style={{ fontSize: '18px', flexShrink: 0 }}>
                          {n.type === 'profile_view' ? 'eye' : n.type === 'interest_received' ? 'heart' : 'bell'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#111827', lineHeight: 1.4 }}>{n.message}</p>
                          {n.created_at && (
                            <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                              {new Date(n.created_at).toLocaleDateString('en-GB')}
                            </p>
                          )}
                        </div>
                        {!n.is_read && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e11d48', flexShrink: 0, marginTop: '4px' }} />
                        )}
                      </div>
                    ))"""

new = """                    ) : notifs.map((n: any, i: number) => (
                      <a key={n.id || i} href={n.profile_id ? '/profile/' + n.profile_id : n.type === 'interest_received' || n.type === 'contact_request' ? '/interests' : n.type === 'new_message' ? '/messages' : '/dashboard'} onClick={() => setShowNotifs(false)} style={{ padding: '12px 16px', borderBottom: '1px solid #f9fafb', background: n.is_read ? 'white' : '#fef2f8', display: 'flex', gap: '10px', alignItems: 'flex-start', textDecoration: 'none', cursor: 'pointer' }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{n.type === 'interest_received' ? '💗' : n.type === 'new_message' ? '💬' : n.type === 'contact_request' ? '📋' : '🔔'}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#111827', lineHeight: 1.4 }}>{n.message}</p>
                          {n.created_at && <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{new Date(n.created_at).toLocaleDateString('en-GB')}</p>}
                        </div>
                        {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e11d48', flexShrink: 0, marginTop: '4px' }} />}
                      </a>
                    ))"""

if old in content:
    content = content.replace(old, new)
    print('Notifications made clickable')
else:
    print('Pattern not found - writing clean version without change')

with open('components/Navbar.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('Done')
