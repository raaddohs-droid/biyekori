content = open('app/page.tsx', 'r', encoding='utf-8').read()

# Find and replace the entire logo div
start = content.find("        <div style={{ width: '100%', minHeight: '220px'")
end = content.find("</div>", start) + 6
old = content[start:end]
print('Found block:', repr(old[:100]))

new = """        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
          <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="g1" cx="35%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#FFF8C0"/>
                <stop offset="20%" stopColor="#F0C040"/>
                <stop offset="50%" stopColor="#C07800"/>
                <stop offset="78%" stopColor="#E8A820"/>
                <stop offset="100%" stopColor="#7A4A00"/>
              </radialGradient>
              <radialGradient id="g2" cx="65%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#FFF8C0"/>
                <stop offset="20%" stopColor="#F0C040"/>
                <stop offset="50%" stopColor="#C07800"/>
                <stop offset="78%" stopColor="#E8A820"/>
                <stop offset="100%" stopColor="#7A4A00"/>
              </radialGradient>
            </defs>
            <circle cx="58" cy="50" r="34" stroke="#2a1800" strokeWidth="14" fill="none"/>
            <circle cx="58" cy="50" r="34" stroke="url(#g1)" strokeWidth="11" fill="none"/>
            <circle cx="102" cy="50" r="34" stroke="#2a1800" strokeWidth="14" fill="none"/>
            <circle cx="102" cy="50" r="34" stroke="url(#g2)" strokeWidth="11" fill="none"/>
          </svg>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 5vw, 44px)', fontWeight: 700, color: '#F0C040', letterSpacing: '3px', marginTop: '8px' }}>biyekori</div>
        </div>"""

content = content[:start] + new + content[end:]
open('app/page.tsx', 'w', encoding='utf-8', newline='\n').write(content)
print('Done')
