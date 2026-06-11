path = 'components/Navbar.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken section - change </a> back to </div> and }) back to ))
old = """                      </a>
                    })"""
new = """                      </div>
                    ))"""

if old in content:
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print('Done - restored closing tags')
else:
    print('Not found')
    idx = content.find('</a>\n                    })')
    print('Searching alternate...')
    idx2 = content.find('notifHref')
    if idx2 > -1:
        print(repr(content[idx2+350:idx2+500]))
