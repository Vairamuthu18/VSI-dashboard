import re

# 1. Update DashboardHeader.tsx
file_path = r'src/components/DashboardHeader.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Header background
content = content.replace('bg-[#1F1F1F]/90 backdrop-blur-md border-white/5', 'bg-white border-gray-100')
content = content.replace('bg-[#1F1F1F]/90 backdrop-blur-md border-b border-white/5', 'bg-white border-b border-gray-100')

# Text colors
content = content.replace('text-white tracking-wide', 'text-gray-900 tracking-wide font-bold')

# Nav pills container
content = content.replace('bg-[#1F1F1F] rounded-full p-1 border border-white/5', 'bg-gray-100 rounded-full p-1 border border-gray-200')
# Nav active item
content = content.replace('bg-white text-black shadow-sm', 'bg-white text-black shadow-sm') # Same
# Nav inactive item
content = content.replace('text-gray-400 hover:text-white', 'text-gray-500 hover:text-black')

# Right actions
content = content.replace('bg-[#1F1F1F] border border-white/5', 'bg-gray-100 border border-transparent')
content = content.replace('hover:bg-[#2B2B2B]', 'hover:bg-gray-200')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update DashboardNav.tsx
file_path2 = r'src/components/DashboardNav.tsx'
with open(file_path2, 'r', encoding='utf-8') as f:
    content2 = f.read()

content2 = content2.replace('bg-[#1F1F1F] rounded-full p-1 border border-white/5', 'bg-gray-100 rounded-full p-1 border border-gray-200')
content2 = content2.replace('text-gray-400 hover:text-white', 'text-gray-500 hover:text-black')

with open(file_path2, 'w', encoding='utf-8') as f:
    f.write(content2)

print('Header styles updated to light mode successfully.')
