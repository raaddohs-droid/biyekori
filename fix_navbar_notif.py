import urllib.request

# Fetch current broken navbar
url = 'https://raw.githubusercontent.com/raaddohs-droid/biyekori/main/components/Navbar.tsx'
content = urllib.request.urlopen(url).read().decode('utf-8')

# The broken section - replace the entire map with clean version
old = """                    ) : notifs.map((n: any, i: number) => {
                      const notifHref = n.profile_id ? '/profile/' + n.profile_id : n.type === 'interest_received' || n.type === 'contact_request' ? '/interests' : n.type === 'new_message' ? '/messages' : '/dashboard'
                      return (
                      <a key={n.id || i} href={notifHref} onClick={() => setShowNotifs(false)} style={{
                        padding: '12px 16px', borderBottom: '1px solid #f9fafb',
                        background: n.is_read ? 'white' : '#fef2f8',
                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                        textDecoration: 'none', cursor: 'pointer'
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

new = """                    ) : notifs.map((n: any, i: number) => {
                      const href = n.profile_id ? '/profile/' + n.profile_id : n.type === 'interest_received' || n.type === 'contact_request' ? '/interests' : n.type === 'new_message' ? '/messages' : '/dashboard'
                      return (
                        <a key={n.id || i} href={href} onClick={() => setShowNotifs(false)} style={{ padding: '12px 16px', borderBottom: '1px solid #f9fafb', background: n.is_read ? 'white' : '#fef2f8', display: 'flex', gap: '10px', alignItems: 'flex-start', textDecoration: 'none', cursor: 'pointer' }}>
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>{n.type === 'profile_view' ? '👁' : n.type === 'interest_received' ? '💗' : '🔔'}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#111827', lineHeight: 1.4 }}>{n.message}</p>
                            {n.created_at && <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{new Date(n.created_at).toLocaleDateString('en-GB')}</p>}
                          </div>
                          {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e11d48', flexShrink: 0, marginTop: '4px' }} />}
                        </a>
                      )
                    })"""

if old in content:
    content = content.replace(old, new)
    print('Found and replaced')
else:
    print('Pattern not found - trying alternate search')
    idx = content.find('notifHref')
    if idx == -1:
        # Maybe already partially fixed - find the broken part
        idx2 = content.find("notifs.map((n: any, i: number) => {")
        if idx2 > -1:
            print('Found map with { - showing context:')
            print(repr(content[idx2:idx2+600]))
        else:
            idx3 = content.find("notifs.map")
            print(repr(content[idx3:idx3+600]))
    else:
        print(repr(content[idx-50:idx+400]))

with open('components/Navbar.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('Written')
