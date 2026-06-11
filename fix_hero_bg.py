content = open('app/page.tsx', 'r', encoding='utf-8').read()

old = "<section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',"
new = "<section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: \"url('/hero-bg.jpg')\", backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat',"

if old in content:
    content = content.replace(old, new, 1)
    open('app/page.tsx', 'w', encoding='utf-8', newline='\n').write(content)
    print('Done')
else:
    print('Not found')
