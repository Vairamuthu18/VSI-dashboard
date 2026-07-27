import re

file_path = r'src/app/dashboard/competitors/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace global page styling
content = content.replace('className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans"', 'className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans bg-[#F9FAFB] min-h-screen"')

# Replace border, text, and bg colors
replacements = [
    (r'text-slate-900', 'text-[#1F1F1F]'),
    (r'border-slate-200', 'border-[#E8E8E8]'),
    (r'text-slate-500', 'text-[#6B7280]'),
    (r'text-slate-400', 'text-[#6B7280]'),
    (r'text-slate-600', 'text-[#6B7280]'),
    (r'bg-slate-50', 'bg-[#F5F5F5]'),
    (r'bg-slate-100', 'bg-[#F5F5F5]'),
    (r'text-blue-600', 'text-[#F56A3D]'),
    (r'text-blue-700', 'text-[#F56A3D]'),
    (r'bg-blue-600', 'bg-black'),
    (r'hover:bg-blue-700', 'hover:bg-gray-800'),
    (r'text-emerald-600', 'text-[#22C55E]'),
    (r'text-emerald-700', 'text-[#22C55E]'),
    (r'text-amber-600', 'text-[#EF4444]'),
    (r'text-amber-700', 'text-[#EF4444]'),
    (r'bg-blue-50', 'bg-[#FFF0EB]'),
    (r'border-blue-200', 'border-[#FFD5C8]'),
    (r'bg-emerald-50', 'bg-[#F0FDF4]'),
    (r'border-emerald-200', 'border-[#BBF7D0]'),
    (r'bg-amber-50', 'bg-[#FEF2F2]'),
    (r'border-amber-200', 'border-[#FECACA]'),
    (r'bg-slate-900/40', 'bg-[#1F1F1F]/40'),
    
    # Border Radii and Padding
    (r'rounded-2xl', 'rounded-[24px]'),
    (r'rounded-xl', 'rounded-full'),
    (r'p-5 border', 'p-6 border'),
    (r'shadow-xs', 'shadow-sm'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Competitors page updated successfully.")
