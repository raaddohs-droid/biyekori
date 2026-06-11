# Remove frosted glass from page.tsx
content = open('app/page.tsx', 'r', encoding='utf-8').read()
old = "background: 'rgba(8,6,4,0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '24px', maxWidth: '480px', margin: '0 auto', padding: '12px 0', "
new = ""
content = content.replace(old, new)
open('app/page.tsx', 'w', encoding='utf-8', newline='\n').write(content)
print('page.tsx done')

# Make LogoAnimation fully transparent
content2 = open('components/LogoAnimation.tsx', 'r', encoding='utf-8').read()
content2 = content2.replace("ctx.fillStyle = '#080604';\n      ctx.fillRect(0, 0, W, H);\n      initializedRef.current = true;", "ctx.clearRect(0, 0, W, H);\n      initializedRef.current = true;")
content2 = content2.replace("ctx.fillStyle = '#080604';\n      ctx.fillRect(0, 0, W, H);\n\n      const t = Math.min(elapsed / 500, 1);", "ctx.clearRect(0, 0, W, H);\n\n      const t = Math.min(elapsed / 500, 1);")
content2 = content2.replace("ctx.fillStyle = '#080604';\n      ctx.fillRect(0, 0, W, H);\n\n      lx = cx - gap; rx = cx + gap;", "ctx.clearRect(0, 0, W, H);\n\n      lx = cx - gap; rx = cx + gap;")
# Also make trail transparent
content2 = content2.replace("ctx.fillStyle = 'rgba(8, 6, 4, 0.12)';", "ctx.fillStyle = 'rgba(0, 0, 0, 0.0)';")
open('components/LogoAnimation.tsx', 'w', encoding='utf-8', newline='\n').write(content2)
print('LogoAnimation.tsx done')
