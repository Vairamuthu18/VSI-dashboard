import re

file_path = 'src/app/dashboard/check/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Primary replacements
replacements = [
    ('bg-[#111111]', 'bg-[#F5F5F3]'),
    ('bg-[#1C1C1E]', 'bg-[#FFFFFF]'),
    ('bg-[#161616]', 'bg-[#FFFFFF]'),
    ('border-white/5', 'border-[#E8E8E8]'),
    ('border-white/10', 'border-[#E8E8E8]'),
    ('border-[#FF4500]/20', 'border-[#E8E8E8]'),
    ('text-white', 'text-[#181818]'),
    ('text-gray-200', 'text-[#181818]'),
    ('text-gray-300', 'text-[#181818]'),
    ('text-gray-400', 'text-[#666666]'),
    ('text-gray-500', 'text-[#666666]'),
    ('text-gray-600', 'text-[#666666]'),
    ('text-[#FF4500]', 'text-[#F9733D]'),
    ('bg-[#FF4500]', 'bg-[#F9733D]'),
    ('bg-[#FF4500]/10', 'bg-[#F9733D]/10'),
    ('border-[#FF4500]', 'border-[#F9733D]'),
    ('border-[#FF4500]/30', 'border-[#F9733D]/30'),
    ('border-[#FF4500]/50', 'border-[#F9733D]/50'),
    ('border-[#FF4500]/60', 'border-[#F9733D]/60'),
    ('#00E676', '#22C55E'),
    ('bg-[#282828]', 'bg-[#F5F5F3]'), # for pill tags and skeleton
]

for old, new in replacements:
    content = content.replace(old, new)

# Fix button
# From: bg-[#F9733D] hover:bg-[#e03d00] disabled:opacity-50 disabled:cursor-not-allowed text-[#181818] text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors
# To: bg-[#181818] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-[#FFFFFF] text-sm font-semibold px-6 py-2.5 rounded-full transition-colors
content = content.replace(
    'bg-[#F9733D] hover:bg-[#e03d00] disabled:opacity-50 disabled:cursor-not-allowed text-[#181818] text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors',
    'bg-[#181818] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-[#FFFFFF] text-sm font-semibold px-6 py-2.5 rounded-full transition-colors'
)

# Fix border radius for cards
content = content.replace('rounded-2xl', 'rounded-[20px]')
content = content.replace('rounded-[2rem]', 'rounded-[20px]')

# Inputs rounded-full or rounded-[20px]? The spec says corner radius 18-24px, card radius 20px, buttons 999px.
content = content.replace('rounded-xl', 'rounded-[18px]')

# Fix small tags where text was turned black but should be white
content = content.replace('bg-[#F9733D] text-[#181818]', 'bg-[#F9733D] text-[#FFFFFF]')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated page.tsx")
