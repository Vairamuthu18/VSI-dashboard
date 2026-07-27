import re

file_path = 'src/app/dashboard/tasks/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # Container and Backgrounds
    ('bg-[#111111]', 'bg-[#F5F5F3]'),
    ('bg-[#1C1C1E]', 'bg-[#FFFFFF]'),
    ('bg-[#161616]', 'bg-[#FFFFFF]'),
    
    # Borders
    ('border-white/5', 'border-[#E8E8E8]'),
    ('border-white/10', 'border-[#E8E8E8]'),
    ('border-[#00E676]/20', 'border-[#22C55E]/20'),
    ('hover:border-white/10', 'hover:border-[#F9733D]/50'),
    
    # Text Colors
    ('text-white', 'text-[#181818]'),
    ('text-gray-200', 'text-[#181818]'),
    ('text-gray-300', 'text-[#181818]'),
    ('text-gray-400', 'text-[#666666]'),
    ('text-gray-500', 'text-[#666666]'),
    ('text-gray-600', 'text-[#666666]'),
    ('text-gray-700', 'text-[#666666]'),
    ('hover:text-gray-300', 'hover:text-[#181818]'),
    
    # Accent Colors
    ('text-[#FF4500]', 'text-[#F9733D]'),
    ('bg-[#FF4500]', 'bg-[#F9733D]'),
    ('bg-[#FF4500]/10', 'bg-[#F9733D]/10'),
    ('bg-[#FF4500]/20', 'bg-[#F9733D]/20'),
    ('bg-[#FF4500]/60', 'bg-[#F9733D]/60'),
    ('text-[#FF4500]/60', 'text-[#F9733D]/60'),
    ('border-[#FF4500]', 'border-[#F9733D]'),
    ('border-[#FF4500]/30', 'border-[#F9733D]/30'),
    ('border-[#FF4500]/50', 'border-[#F9733D]/50'),
    ('border-[#FF4500]/60', 'border-[#F9733D]/60'),
    
    ('#00E676', '#22C55E'),
    ('#FFD600', '#3B82F6'),  # Mapping yellow to Info blue for In Progress
    
    ('bg-[#282828]', 'bg-[#F5F5F3]'), # progress bars background
]

for old, new in replacements:
    content = content.replace(old, new)

# Fix Button
content = content.replace(
    'bg-[#F9733D] hover:bg-[#e03d00] text-[#181818] text-sm font-medium px-4 py-2.5 rounded-xl transition-colors',
    'bg-[#181818] hover:bg-black text-[#FFFFFF] text-sm font-medium px-4 py-2.5 rounded-full transition-colors'
)

# Fix Tabs active state
content = content.replace(
    'active ? "bg-[#F9733D] text-[#181818]" : "text-[#666666] hover:text-[#181818]"',
    'active ? "bg-[#181818] text-[#FFFFFF]" : "text-[#666666] hover:text-[#181818]"'
)

# Border Radius
content = content.replace('rounded-2xl', 'rounded-[20px]')
content = content.replace('rounded-[2rem]', 'rounded-[20px]')
content = content.replace('rounded-xl', 'rounded-[18px]')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated tasks page.tsx")
