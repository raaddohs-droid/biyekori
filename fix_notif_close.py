path = 'components/Navbar.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old = '                      </div>\n                    ))}'
new = '                      </a>\n                      )\n                    })'

if old in content:
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print('Done')
else:
    print('Not found')
    idx = content.find('notifHref')
    if idx > -1:
        print(repr(content[idx+300:idx+500]))
