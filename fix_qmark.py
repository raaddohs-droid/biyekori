for fname in ['components/profiles/ProfileCard.tsx', 'components/profiles/ProfilesGrid.tsx']:
    content = open(fname, 'r', encoding='utf-8').read()
    content = content.replace(
        '<span style={{ fontSize: \'10px\', color: \'white\', opacity: 0.8, border: \'1px solid rgba(255,255,255,0.6)\', borderRadius: \'50%\', width: \'13px\', height: \'13px\', display: \'inline-flex\', alignItems: \'center\', justifyContent: \'center\', flexShrink: 0 }}>i</span>',
        ''
    )
    open(fname, 'w', encoding='utf-8', newline='\n').write(content)
    print(fname, 'done')
