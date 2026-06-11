content = open('app/page.tsx', 'r', encoding='utf-8').read()

# Fix H1 - remove nowrap, increase weight
content = content.replace(
    "whiteSpace: 'nowrap', textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.6)'",
    "textShadow: '0 2px 20px rgba(0,0,0,0.9), 0 4px 40px rgba(0,0,0,0.7)', fontWeight: 900"
)

# Fix Bengali heading size
content = content.replace(
    "fontSize: 'clamp(16px, 1.8vw, 22px)', fontWeight: 700, color: '#FFE066'",
    "fontSize: 'clamp(22px, 2.8vw, 36px)', fontWeight: 700, color: '#FFE066'"
)

# Fix Bengali subtitle size
content = content.replace(
    "fontSize: 'clamp(15px, 1.6vw, 20px)', color: '#FFD700'",
    "fontSize: 'clamp(18px, 2.2vw, 28px)', color: '#FFD700'"
)

open('app/page.tsx', 'w', encoding='utf-8', newline='\n').write(content)
print('Done')
