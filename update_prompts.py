import re

file_path = 'src/app/dashboard/prompts/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # General Texts
    ('text-slate-900 dark:text-white', 'text-[#181818]'),
    ('text-slate-900 dark:text-slate-100', 'text-[#181818]'),
    ('text-slate-800 dark:text-slate-200', 'text-[#181818]'),
    ('text-slate-700 dark:text-slate-300', 'text-[#181818]'),
    ('text-slate-500 dark:text-slate-400', 'text-[#666666]'),
    ('text-slate-400 dark:text-slate-500', 'text-[#666666]'),
    ('text-slate-400', 'text-[#666666]'),
    
    # Backgrounds & Cards
    ('bg-white dark:bg-slate-900', 'bg-[#FFFFFF]'),
    ('bg-slate-50 dark:bg-slate-950', 'bg-[#FFFFFF]'),
    ('bg-slate-50 dark:bg-slate-800/50', 'bg-[#FFFFFF]'),
    ('bg-slate-100 dark:bg-slate-800', 'bg-[#F5F5F3]'),
    
    # Borders
    ('border-slate-200 dark:border-slate-800', 'border-[#E8E8E8]'),
    ('border-slate-200 dark:border-slate-700', 'border-[#E8E8E8]'),
    ('hover:border-slate-300 dark:hover:border-slate-700', 'hover:border-[#D1D5DB]'),
    
    # Accent Colors
    ('text-blue-600 dark:text-blue-400', 'text-[#F9733D]'),
    ('focus:border-blue-500', 'focus:border-[#F9733D]'),
    
    # Success Alert
    ('bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 p-3.5 flex items-center gap-2 text-emerald-800 dark:text-emerald-300', 
     'bg-[#22C55E]/10 border border-[#22C55E]/20 p-3.5 flex items-center gap-2 text-[#22C55E]'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Update Save Button
content = content.replace(
    'rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold',
    'rounded-full bg-[#181818] hover:bg-black text-[#FFFFFF] px-4 py-2 text-xs font-semibold'
)

# Update Simulate Button
content = content.replace(
    'rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2',
    'rounded-full bg-[#FFFFFF] border border-[#E8E8E8] hover:border-[#D1D5DB] text-[#181818] px-4 py-2'
)

# Active List Item
content = content.replace(
    'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 shadow-xs',
    'bg-[#181818] border-[#181818] text-[#FFFFFF] shadow-md'
)

# Text color for active list item title and desc
# p.name has 'text-xs font-bold text-[#181818]' after previous replace
content = content.replace(
    '<p className="text-xs font-bold text-[#181818]">{p.name}</p>',
    '<p className={`text-xs font-bold ${active ? "text-[#FFFFFF]" : "text-[#181818]"}`}>{p.name}</p>'
)
# p.template has 'text-[11px] text-[#666666] mt-1 line-clamp-2'
content = content.replace(
    '<p className="text-[11px] text-[#666666] mt-1 line-clamp-2">',
    '<p className={`text-[11px] mt-1 line-clamp-2 ${active ? "text-[#FFFFFF]/70" : "text-[#666666]"}`}>'
)

# Radius updates
content = content.replace('rounded-2xl', 'rounded-[20px]')
content = content.replace('rounded-xl', 'rounded-[20px]')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated prompts page.tsx")
