content = open('app/page.tsx', 'r', encoding='utf-8').read()
old = """          <Link href="/register" style={{ padding: '18px 56px', background: 'linear-gradient(135deg,#F0C040,#C07800)', color: '#080604', fontSize: '14px', fontWeight: 700, textDecoration: 'none', borderRadius: '4px', letterSpacing: '2px' }}>JOIN FREE</Link>
          <Link href="/profiles" style={{ padding: '18px 56px', border: '1px solid rgba(240,192,64,0.3)', color: 'rgba(253,246,238,0.5)', fontSize: '14px', textDecoration: 'none', borderRadius: '4px', letterSpacing: '2px' }}>BROWSE</Link>"""
new = "          <HomeCTA2 />"
if old in content:
    content = content.replace(old, new)
    open('app/page.tsx', 'w', encoding='utf-8', newline='\n').write(content)
    print('Done')
else:
    print('Not found')
