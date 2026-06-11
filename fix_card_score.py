content = open('components/profiles/ProfileCard.tsx', 'r', encoding='utf-8').read()
old = "          cursor: 'default'\n        }} title={viewerProfile ? 'Personalized match based on your preferences' : 'General compatibility score'}>\n          <span style={{ fontSize: '9px', color: 'white', fontWeight: 600, opacity: 0.85 }}>AI</span>\n          <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{score}%</span>\n          {viewerProfile && (\n            <span style={{ fontSize: '9px', color: 'white', fontWeight: 600, opacity: 0.75 }}>{scoreLabel}</span>\n          )}"
new = "          cursor: 'pointer'\n        }} onClick={() => alert(viewerProfile ? 'AI Match Score: ' + score + '% - Personalized based on your preferences. Factors: Age, Religion, Education, Location, Family type, Income, Height, Lifestyle, Personality.' : 'AI Match Score: ' + score + '% - General compatibility score. Fill partner preferences for a personalized score.')}>\n          <span style={{ fontSize: '9px', color: 'white', fontWeight: 600, opacity: 0.85 }}>AI</span>\n          <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{score}%</span>\n          <span style={{ fontSize: '11px', color: 'white', fontWeight: 700 }}>?</span>"
if old in content:
    content = content.replace(old, new)
    open('components/profiles/ProfileCard.tsx', 'w', encoding='utf-8', newline='\n').write(content)
    print('Done')
else:
    print('Not found')
