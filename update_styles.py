import re

# 1. Update DashboardClientView.tsx
file_path = r'src/components/DashboardClientView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make all cards rounded-3xl (24px)
content = content.replace('rounded-[16px]', 'rounded-[24px]')
# Card paddings
content = content.replace('p-5 border', 'p-6 border')
# Global background
content = content.replace('className=\"p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans transition-colors\"', 'className=\"p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans transition-colors bg-[#F9FAFB] min-h-screen\"')

# Toolbar controls
content = content.replace('rounded-xl px-3.5', 'rounded-full px-4')
content = content.replace('rounded-xl bg-[#1F1F1F]', 'rounded-full bg-black')
content = content.replace('rounded-xl bg-[#F56A3D]', 'rounded-full bg-white border border-gray-200 text-gray-800')

# Extract the block to replace for card 1. We will use a regex to capture it.
card1_pattern = re.compile(r'<div className=\"bg-white dark:bg-\[#1F1F1F\] rounded-\[24px\] p-6 border border-\[#E8E8E8\]/80 dark:border-\[#1F1F1F\] shadow-\[0_4px_20px_rgba\(0,0,0,0\.05\)\] hover:border-\[#F56A3D\]/50 hover:shadow-md transition-all\">.*?Weighted AI share of voice\s*</p>\s*</div>', re.DOTALL)
card1_new = '''<div className=\"bg-gradient-to-br from-[#FF6B35] to-[#F55216] rounded-[24px] p-6 shadow-lg shadow-orange-500/20 transition-all text-white\">
          <div className=\"flex items-center justify-between mb-4\">
            <span className=\"text-xs font-bold text-white/80 uppercase tracking-wider\">
              AI Visibility Score
            </span>
            <span className=\"p-2 rounded-full bg-white/20 text-white\">
              <Sparkles size={18} />
            </span>
          </div>
          <div className=\"flex items-baseline gap-2\">
            <span className=\"text-3xl sm:text-4xl font-extrabold text-white tracking-tight\">
              {aiVisibilityScore}%
            </span>
            <span className=\"text-xs font-bold text-white/90 flex items-center bg-white/20 px-2 py-1 rounded-full\">
              <ArrowUpRight size={12} className=\"mr-1\" /> +4.1%
            </span>
          </div>
          <p className=\"text-[11px] text-white/70 mt-4 font-medium\">
            Weighted AI share of voice
          </p>
        </div>'''
content = re.sub(card1_pattern, card1_new, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update TrajectoryChart.tsx
file_path2 = r'src/components/TrajectoryChart.tsx'
with open(file_path2, 'r', encoding='utf-8') as f:
    content2 = f.read()

content2 = content2.replace('rounded-[16px]', 'rounded-[24px]')

tabs_pattern = re.compile(r'className=\{\`px-3 py-1 rounded-lg text-xs font-semibold transition-all \$\{\s*active.*?\s*\}\`\}', re.DOTALL)
tabs_new = '''className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  active
                    ? "bg-black text-white shadow-md"
                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                }`}'''
content2 = re.sub(tabs_pattern, tabs_new, content2)

with open(file_path2, 'w', encoding='utf-8') as f:
    f.write(content2)

# 3. Update Sidebar.tsx
file_path3 = r'src/components/Sidebar.tsx'
with open(file_path3, 'r', encoding='utf-8') as f:
    content3 = f.read()

nav_pattern = re.compile(r'className=\{\`flex items-center justify-between gap-2\.5 rounded-xl px-3 py-2 text-xs transition-all \$\{\s*active.*?\s*\}\`\}', re.DOTALL)
nav_new = '''className={`flex items-center justify-between gap-2.5 rounded-full px-4 py-2.5 text-xs transition-all ${
                      active
                        ? "bg-black text-white font-semibold shadow-md"
                        : "text-gray-500 hover:bg-gray-100 hover:text-black font-medium"
                    }`}'''
content3 = re.sub(nav_pattern, nav_new, content3)

client_nav_pattern = re.compile(r'className=\{\`flex items-center justify-between gap-2 rounded-xl px-2\.5 py-2 text-xs transition-all group \$\{\s*active.*?\s*\}\`\}', re.DOTALL)
client_nav_new = '''className={`flex items-center justify-between gap-2 rounded-full px-3 py-2 text-xs transition-all group ${
                  active
                    ? "bg-black text-white font-semibold shadow-md"
                    : "text-gray-500 hover:bg-gray-100 hover:text-black"
                }`}'''
content3 = re.sub(client_nav_pattern, client_nav_new, content3)

footer_pattern = re.compile(r'<div className=\"px-4 py-3\.5 border-t border-\[#E8E8E8\]/80 dark:border-\[#1F1F1F\] bg-\[#F5F5F5\]/60 dark:bg-\[#1F1F1F\]/60 shrink-0 space-y-2\.5\">')
footer_new = '''<div className="mx-4 mb-4 mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-100 shrink-0 space-y-3 shadow-sm">'''
content3 = re.sub(footer_pattern, footer_new, content3)

with open(file_path3, 'w', encoding='utf-8') as f:
    f.write(content3)

print('Modifications applied successfully.')
