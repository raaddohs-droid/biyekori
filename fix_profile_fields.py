content = open('app/edit-profile/page.tsx', 'r', encoding='utf-8').read()

# Fix 1: Age range min 18, max 65 (48 options: 18-65)
content = content.replace(
    "{Array.from({length: 35}, (_, i) => i + 18).map(a => <option key={a} value={a}>{a}</option>)}",
    "{Array.from({length: 48}, (_, i) => i + 18).map(a => <option key={a} value={a}>{a}</option>)}"
)

# Fix 2: Children options expanded
old_children = '''<label className={labelClass}>Have Children</label>
                <select value={hasChildren} onChange={e => setHasChildren(e.target.value)} className={inputClass}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>'''
new_children = '''<label className={labelClass}>Have Children</label>
                <select value={hasChildren} onChange={e => setHasChildren(e.target.value)} className={inputClass}>
                  <option value="false">No</option>
                  <option value="living_with">Yes, living with me</option>
                  <option value="not_living_with">Yes, not living with me</option>
                  <option value="sometimes">Yes, sometimes with me</option>
                </select>'''
content = content.replace(old_children, new_children)

# Fix 3: Expected marital status - multi select checkboxes
old_marital = '''<label className={labelClass}>Expected Marital Status</label>
                <select value={expectedMaritalStatus} onChange={e => setExpectedMaritalStatus(e.target.value)} className={inputClass}>
                  <option value="">Any</option>
                  {MARITAL_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>'''
new_marital = '''<label className={labelClass}>Accepted Marital Status <span style={{fontSize:'11px',color:'#9ca3af',fontWeight:400}}>(select all that apply)</span></label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'4px'}}>
                  {MARITAL_STATUSES.map(m => (
                    <label key={m} style={{display:'flex',alignItems:'center',gap:'6px',padding:'6px 12px',border:`2px solid ${expectedMaritalStatus.includes(m) ? '#e11d48' : '#e5e7eb'}`,borderRadius:'8px',cursor:'pointer',background:expectedMaritalStatus.includes(m) ? '#fff1f2' : 'white',fontSize:'13px',fontWeight:expectedMaritalStatus.includes(m) ? 700 : 400,color:expectedMaritalStatus.includes(m) ? '#e11d48' : '#374151'}}>
                      <input type="checkbox" checked={expectedMaritalStatus.includes(m)} onChange={e => {
                        const current = expectedMaritalStatus ? expectedMaritalStatus.split(',').filter(Boolean) : []
                        if (e.target.checked) setExpectedMaritalStatus([...current, m].join(','))
                        else setExpectedMaritalStatus(current.filter(x => x !== m).join(','))
                      }} style={{display:'none'}} />
                      {m}
                    </label>
                  ))}
                </div>'''
content = content.replace(old_marital, new_marital)

open('app/edit-profile/page.tsx', 'w', encoding='utf-8', newline='\n').write(content)
print('Done - checking replacements:')
print('Age fix:', '{length: 48}' in content)
print('Children fix:', 'living_with' in content)
print('Marital fix:', 'select all that apply' in content)
