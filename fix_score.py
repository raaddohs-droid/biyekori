import re

content = open('components/profiles/ProfilesGrid.tsx', 'r', encoding='utf-8').read()
content = re.sub(
    r'onClick=\{\(e\).*?alert\(.*?\)\s*\}\}',
    "onClick={(e) => { e.stopPropagation(); alert(viewerProfile ? 'AI Match Score: ' + score + '% — Personalized based on your preferences. Factors: Age, Religion, Education, Location, Family type, Income, Height, Lifestyle, Personality.' : 'AI Match Score: ' + score + '% — General score. Fill partner preferences for a personalized score.') }}",
    content, flags=re.DOTALL, count=1
)
open('components/profiles/ProfilesGrid.tsx', 'w', encoding='utf-8', newline='\n').write(content)
print('Done')
