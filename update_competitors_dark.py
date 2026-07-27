import re

file_path = r'src/app/dashboard/competitors/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # Backgrounds
    (r'bg-\[#F9FAFB\]', 'bg-[#16181D]'),
    (r'bg-white', 'bg-[#1B1D23]'),
    (r'bg-\[#F5F5F5\]', 'bg-[#0F1117]'),
    
    # Text Colors
    (r'text-\[#1F1F1F\]', 'text-[#FFFFFF]'),
    (r'text-\[#6B7280\]', 'text-[#9CA3AF]'),
    (r'text-\[#F56A3D\]', 'text-[#FF5A1F]'),
    
    # Borders
    (r'border-\[#E8E8E8\]', 'border-[#2A2D35]'),
    
    # Buttons
    (r'bg-black', 'bg-[#FF5A1F]'),
    (r'hover:bg-gray-800', 'hover:bg-[#FF6B35]'),
    
    # Hover states & Overlays
    (r'hover:bg-\[#F5F5F5\]', 'hover:bg-[#2A2D35]'),
    (r'bg-black/40', 'bg-[#0F1117]/80'),
    
    # Badges (Tied, Leading, Lagging)
    (r'bg-\[#FEF2F2\]', 'bg-[#EF4444]/10'),
    (r'border-\[#FECACA\]', 'border-[#EF4444]/20'),
    
    (r'bg-\[#FFF0EB\]', 'bg-[#FACC15]/10'),
    (r'border-\[#FFD5C8\]', 'border-[#FACC15]/20'),
    
    (r'bg-\[#F0FDF4\]', 'bg-[#22C55E]/10'),
    (r'border-\[#BBF7D0\]', 'border-[#22C55E]/20'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

# Additionally, update the text color for the "Tied" status which was previously F56A3D but we want it Yellow (Warning) now.
# We'll just replace the specific text color in that gapStatus block.
# Currently it is: text-[#FF5A1F] (since we replaced F56A3D globally above). Let's fix that specific one to #FACC15
gap_status_tied = r'bg-\[#FACC15\]/10 dark:bg-blue-950 text-\[#FF5A1F\] dark:text-blue-300 border border-\[#FACC15\]/20'
gap_status_tied_new = r'bg-[#FACC15]/10 dark:bg-blue-950 text-[#FACC15] dark:text-blue-300 border border-[#FACC15]/20'
content = content.replace('bg-[#FACC15]/10 dark:bg-blue-950 text-[#FF5A1F]', 'bg-[#FACC15]/10 dark:bg-blue-950 text-[#FACC15]')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Competitors page updated to Premium Dark SaaS Dashboard successfully.")
