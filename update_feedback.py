import re

file_path = 'src/app/dashboard/feedback/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # General Texts
    ('text-slate-900 dark:text-white', 'text-[#181818]'),
    ('text-slate-700 dark:text-slate-300', 'text-[#181818]'),
    ('text-slate-700 dark:text-slate-200', 'text-[#181818]'),
    ('text-slate-600 dark:text-slate-400', 'text-[#666666]'),
    ('text-slate-500 dark:text-slate-400', 'text-[#666666]'),
    ('text-slate-400', 'text-[#666666]'),
    
    # Backgrounds & Cards
    ('bg-white dark:bg-slate-900', 'bg-[#FFFFFF]'),
    ('bg-slate-50 dark:bg-slate-800', 'bg-[#F5F5F3]'),
    ('bg-slate-100 dark:bg-slate-800', 'bg-[#F5F5F3]'),
    ('hover:bg-blue-50 dark:hover:bg-blue-950', 'hover:bg-[#F9733D]/10 hover:text-[#F9733D]'),
    
    # Borders
    ('border-slate-200 dark:border-slate-800', 'border-[#E8E8E8]'),
    ('border-slate-200 dark:border-slate-700', 'border-[#E8E8E8]'),
    ('hover:border-slate-300 dark:hover:border-slate-700', 'hover:border-[#D1D5DB]'),
    
    # Accent Colors
    ('text-blue-600 dark:text-blue-400', 'text-[#F9733D]'),
    ('hover:text-blue-600', 'hover:text-[#F9733D]'),
    ('focus:border-blue-500', 'focus:border-[#F9733D]'),
    
    # Submit Button
    ('bg-blue-600 hover:bg-blue-700 text-white', 'bg-[#181818] hover:bg-black text-[#FFFFFF]'),
    
    # Success Alert
    ('bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 p-3.5 flex items-center gap-2 text-emerald-800 dark:text-emerald-300', 
     'bg-[#22C55E]/10 border border-[#22C55E]/20 p-3.5 flex items-center gap-2 text-[#22C55E]'),
     
    # Badges
    ('bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300', 'bg-[#22C55E]/10 text-[#22C55E]'),
    ('bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300', 'bg-[#3B82F6]/10 text-[#3B82F6]'),
    ('bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800', 'bg-[#F9733D]/10 text-[#F9733D] border-[#F9733D]/20'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Fix pill shape for the submit button specifically (which is now text-[#FFFFFF])
content = content.replace(
    'rounded-xl bg-[#181818] hover:bg-black text-[#FFFFFF] px-4 py-2.5',
    'rounded-full bg-[#181818] hover:bg-black text-[#FFFFFF] px-4 py-2.5'
)

# Fix upvote button text color bug from mapping
content = content.replace('text-[#181818] hover:text-[#F9733D]', 'text-[#666666] hover:text-[#F9733D]')

# Global radii
content = content.replace('rounded-2xl', 'rounded-[20px]')
content = content.replace('rounded-xl', 'rounded-[20px]')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated feedback page.tsx")
