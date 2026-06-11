content = open('app/page.tsx', 'r', encoding='utf-8').read()
start = content.find("        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>")
end = content.find("        </div>", start) + 14
old = content[start:end]
new = "        <div style={{ position: 'relative', zIndex: 2, marginTop: '16px', textAlign: 'center' }}>\n          <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 5vw, 44px)', fontWeight: 700, color: '#F0C040', letterSpacing: '3px' }}>biyekori</div>\n        </div>"
content = content[:start] + new + content[end:]
open('app/page.tsx', 'w', encoding='utf-8', newline='\n').write(content)
print('Done')
