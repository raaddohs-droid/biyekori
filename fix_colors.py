content = open('app/page.tsx', 'r', encoding='utf-8').read()

# H1 - "Your person is out there" - add strong text shadow
old1 = "color: '#FDF6EE', margin: '0 0 24px', lineHeight: 1, letterSpacing: '-2px', position: 'relative', zIndex: 2, whiteSpace: 'nowrap'"
new1 = "color: '#FFFFFF', margin: '0 0 24px', lineHeight: 1, letterSpacing: '-2px', position: 'relative', zIndex: 2, whiteSpace: 'nowrap', textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.6)'"
content = content.replace(old1, new1)

# Bengali heading - "বিয়ে করি ম্যাট্রিমনি"
old2 = "fontWeight: 700, color: '#F0C040', margin: '0 0 8px', letterSpacing: '3px', position: 'relative', zIndex: 2"
new2 = "fontWeight: 700, color: '#FFE066', margin: '0 0 8px', letterSpacing: '3px', position: 'relative', zIndex: 2, textShadow: '0 2px 12px rgba(0,0,0,0.9)'"
content = content.replace(old2, new2)

# Bengali subtitle - "মনের মানুষ পাবেই তুমি"
old3 = "color: '#F0C040', margin: '0 0 40px', fontStyle: 'normal', letterSpacing: '2px', position: 'relative', zIndex: 2"
new3 = "color: '#FFD700', margin: '0 0 40px', fontStyle: 'normal', letterSpacing: '2px', position: 'relative', zIndex: 2, textShadow: '0 2px 12px rgba(0,0,0,0.9)'"
content = content.replace(old3, new3)

open('app/page.tsx', 'w', encoding='utf-8', newline='\n').write(content)
print('Done')
