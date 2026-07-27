import re

# --- 1. DashboardClientView.tsx ---
file_path = r'src/components/DashboardClientView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements_overview = [
    # Main Background
    (r'bg-\[#F9FAFB\]', 'bg-[#0F1117]'),
    (r'text-slate-900', 'text-[#FFFFFF]'),
    (r'dark:text-white', 'text-[#FFFFFF]'),
    
    # Text Colors
    (r'text-\[#1F1F1F\]', 'text-[#FFFFFF]'),
    (r'text-gray-900', 'text-[#FFFFFF]'),
    (r'text-\[#6B7280\]', 'text-[#9CA3AF]'),
    (r'text-gray-500', 'text-[#9CA3AF]'),
    (r'text-slate-500', 'text-[#9CA3AF]'),
    (r'text-slate-400', 'text-[#6B7280]'),
    
    # Cards
    (r'bg-white', 'bg-[#1B1D23]'),
    (r'bg-\[#1F1F1F\]', 'bg-[#1B1D23]'),
    (r'dark:bg-\[#1F1F1F\]', ''),
    (r'dark:bg-slate-900', ''),
    (r'rounded-\[24px\]', 'rounded-[20px]'),
    (r'rounded-\[16px\]', 'rounded-[20px]'),
    (r'shadow-\[0_4px_20px_rgba\(0,0,0,0\.05\)\]', 'shadow-[0_15px_40px_rgba(0,0,0,0.35)] transition-all duration-250 ease-out hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(255,90,31,0.15)]'),
    (r'shadow-sm', 'shadow-[0_15px_40px_rgba(0,0,0,0.35)] transition-all duration-250 ease-out hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(255,90,31,0.15)]'),
    
    # Borders
    (r'border-\[#E8E8E8\]', 'border-[#2A2D35]'),
    (r'border-slate-200', 'border-[#2A2D35]'),
    (r'border-slate-100', 'border-[#2A2D35]'),
    (r'dark:border-slate-800', ''),
    
    # Primary Buttons & Accents
    (r'text-\[#F56A3D\]', 'text-[#FF5A1F]'),
    (r'bg-black hover:bg-gray-800', 'bg-[#FF5A1F] hover:bg-[#FF6B35] h-[48px] rounded-[14px] items-center justify-center'),
    (r'bg-\[#F56A3D\] hover:bg-\[#D4532B\]', 'bg-[#FF5A1F] hover:bg-[#FF6B35] h-[48px] rounded-[14px] items-center justify-center'),
    (r'bg-blue-600 hover:bg-blue-700', 'bg-[#FF5A1F] hover:bg-[#FF6B35] h-[48px] rounded-[14px] items-center justify-center'),
    
    # Secondary Buttons
    (r'bg-\[#1F1F1F\] hover:bg-\[#1F1F1F\]', 'bg-[#23262F] hover:bg-[#2A2D35] border border-[#2A2D35] h-[48px] rounded-[14px]'),
    (r'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50', 'bg-[#23262F] hover:bg-[#2A2D35] border border-[#2A2D35] text-white h-[48px] rounded-[14px]'),
    
    # Inputs/Selects
    (r'bg-\[#F5F5F5\]', 'bg-[#151A26] border border-[#2A2D35] focus:border-[#FF5A1F] rounded-[14px] h-[48px]'),
    (r'bg-slate-50', 'bg-[#151A26] border border-[#2A2D35] focus:border-[#FF5A1F] rounded-[14px] h-[48px]'),
    
    # Tags / Pills
    (r'rounded-full', 'rounded-[999px] px-[14px] py-[6px]'),
    (r'px-2\.5 py-1 rounded-md', 'rounded-[999px] px-[14px] py-[6px]'),
    (r'px-3 py-1 rounded-full', 'rounded-[999px] px-[14px] py-[6px]'),
    
    # Specific Card 1 Gradient replacement (Convert back to standard dark card or keep orange?)
    # The prompt says: Card Background #1B1D23. So we should remove the orange gradient to match the unified UI.
    (r'bg-gradient-to-br from-\[#FF6B35\] to-\[#F55216\]', 'bg-[#1B1D23] border border-[#2A2D35]'),
    (r'text-white/80', 'text-[#9CA3AF]'),
    (r'text-white/70', 'text-[#6B7280]'),
    (r'text-white/90', 'text-[#FFFFFF]'),
    (r'bg-white/20', 'bg-[#23262F]'),
]

for old, new in replacements_overview:
    content = re.sub(old, new, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)


# --- 2. Sidebar.tsx ---
file_path2 = r'src/components/Sidebar.tsx'
with open(file_path2, 'r', encoding='utf-8') as f:
    content2 = f.read()

replacements_sidebar = [
    # Sidebar Background
    (r'bg-white', 'bg-[#0B0D12]'),
    (r'bg-\[#1F1F1F\]', 'bg-[#0B0D12]'),
    (r'dark:bg-\[#1F1F1F\]', ''),
    (r'bg-\[#F5F5F5\]', 'bg-[#1B1D23]'),
    
    # Borders
    (r'border-\[#E8E8E8\]', 'border-[#2A2D35]'),
    (r'border-gray-100', 'border-[#2A2D35]'),
    
    # Text Colors
    (r'text-\[#1F1F1F\]', 'text-[#FFFFFF]'),
    (r'text-slate-900', 'text-[#FFFFFF]'),
    (r'text-\[#6B7280\]', 'text-[#9CA3AF]'),
    (r'text-gray-500', 'text-[#9CA3AF]'),
    
    # Active Links
    (r'bg-black text-white font-semibold shadow-md', 'bg-[#FF5A1F] text-[#FFFFFF] font-bold rounded-[14px] shadow-[0_15px_40px_rgba(255,90,31,0.25)]'),
    (r'hover:bg-gray-100 hover:text-black', 'hover:bg-[#1B1D23] hover:text-[#FFFFFF] rounded-[14px]'),
    (r'rounded-full', 'rounded-[14px]'), # In sidebar, buttons/links use 14px radius based on standard button design
]

for old, new in replacements_sidebar:
    content2 = re.sub(old, new, content2)

with open(file_path2, 'w', encoding='utf-8') as f:
    f.write(content2)


# --- 3. DashboardHeader.tsx ---
file_path3 = r'src/components/DashboardHeader.tsx'
with open(file_path3, 'r', encoding='utf-8') as f:
    content3 = f.read()

replacements_header = [
    (r'bg-white', 'bg-[#151A26]'),
    (r'border-gray-100', 'border-[#2A2D35]'),
    (r'text-gray-900', 'text-[#FFFFFF]'),
    (r'text-gray-500', 'text-[#9CA3AF]'),
    (r'hover:text-black', 'hover:text-[#FFFFFF]'),
    (r'bg-gray-100', 'bg-[#0F1117]'),
    (r'border-gray-200', 'border-[#2A2D35]'),
    (r'rounded-full', 'rounded-[14px]'),
]

for old, new in replacements_header:
    content3 = re.sub(old, new, content3)

with open(file_path3, 'w', encoding='utf-8') as f:
    f.write(content3)


# --- 4. TrajectoryChart.tsx ---
file_path4 = r'src/components/TrajectoryChart.tsx'
with open(file_path4, 'r', encoding='utf-8') as f:
    content4 = f.read()

replacements_chart = [
    (r'bg-white', 'bg-[#1B1D23]'),
    (r'text-slate-900', 'text-[#FFFFFF]'),
    (r'border-\[#E8E8E8\]', 'border-[#2A2D35]'),
    (r'rounded-\[24px\]', 'rounded-[20px]'),
    (r'shadow-\[0_4px_20px_rgba\(0,0,0,0\.05\)\]', 'shadow-[0_15px_40px_rgba(0,0,0,0.35)] transition-all duration-250 ease hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(255,90,31,0.15)]'),
    
    (r'bg-black text-white', 'bg-[#23262F] text-[#FFFFFF] border border-[#2A2D35] rounded-[999px]'),
    (r'text-gray-500 hover:text-black hover:bg-gray-100', 'text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[#23262F] rounded-[999px]'),
    (r'rounded-full', 'rounded-[999px] px-[14px] py-[6px]'),
]

for old, new in replacements_chart:
    content4 = re.sub(old, new, content4)

with open(file_path4, 'w', encoding='utf-8') as f:
    f.write(content4)

print('Overview UI styles completely updated to Premium Dark Enterprise SaaS successfully.')
