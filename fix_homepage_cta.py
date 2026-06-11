content = open('app/page.tsx', 'r', encoding='utf-8').read()

# Add import for client CTA component
old_import = 'import LogoWrapper from "@/components/LogoWrapper"\nimport Link from "next/link"'
new_import = 'import LogoWrapper from "@/components/LogoWrapper"\nimport Link from "next/link"\nimport HomeCTA from "@/components/HomeCTA"'
content = content.replace(old_import, new_import)

# Replace JOIN FREE link with HomeCTA component
old_btn = '''<Link href="/register" style={{ display: 'inline-block', padding: '16px 56px', background: 'linear-gradient(135deg, #F0C040, #C07800)', color: '#080604', fontSize: '14px', fontWeight: 700, textDecoration: 'none', borderRadius: '4px', letterSpacing: '3px', position: 'relative', zIndex: 2, marginBottom: '48px' }}>
          JOIN FREE
        </Link>'''
new_btn = '<HomeCTA />'

if old_btn in content:
    content = content.replace(old_btn, new_btn)
    print('Button replaced')
else:
    print('Pattern not found - checking...')
    idx = content.find('JOIN FREE')
    print(repr(content[idx-300:idx+200]))

open('app/page.tsx', 'w', encoding='utf-8', newline='\n').write(content)
