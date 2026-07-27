import os
import re

directories_to_scan = [
    'src/components',
    'src/app'
]

def apply_theme(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Backgrounds and Borders
    # Replace dark backgrounds and explicitly set white backgrounds to use our CSS variables
    content = re.sub(r'bg-\[\#(1B1D23|0B0D12|1F1F1F|121212|2A2D35|23262F|1A1A1A)\]', 'bg-card', content)
    content = re.sub(r'bg-white', 'bg-card', content)
    
    # 2. Text colors
    content = re.sub(r'text-\[\#(9CA3AF|6B7280|8A8A8A|A1A1AA)\]', 'text-muted-foreground', content)
    content = re.sub(r'text-\[\#(FFFFFF|FAFAFA)\]', 'text-foreground', content)
    content = re.sub(r'text-\[\#(181818|1F1F1F|000000)\]', 'text-foreground', content)

    # 3. Primary Colors (Orange variations to primary)
    content = re.sub(r'bg-\[\#(F9733D|F56A3D|FF5A1F|D4532B)\]', 'bg-primary', content)
    content = re.sub(r'text-\[\#(F9733D|F56A3D|FF5A1F|D4532B)\]', 'text-primary', content)
    content = re.sub(r'border-\[\#(F9733D|F56A3D|FF5A1F|D4532B)\]', 'border-primary', content)

    # Secondary Orange or Light Orange
    content = re.sub(r'bg-\[\#(FFF0EB|FFD5C8)\]', 'bg-primary/10', content)

    # 4. Borders
    content = re.sub(r'border-\[\#(2A2D35|1F1F1F|333333|E8E8E8|ECECEC|F1F1F1)\]', 'border-border', content)

    # 5. Remove dark mode utility classes since the theme handles it or they want Soft Light
    content = re.sub(r'dark:[a-zA-Z0-9\-\/\[\]\#]+', '', content)

    # 6. Corner Radius
    # Cards: 20px
    content = re.sub(r'rounded-\[(16px|24px|32px|18px|22px)\]', 'rounded-[20px]', content)
    content = re.sub(r'rounded-(xl|2xl|3xl)', 'rounded-[20px]', content)

    # Buttons/Badges to pill shape
    content = re.sub(r'rounded-\[(999px)\]', 'rounded-full', content)
    
    # 7. Clean up multiple spaces on the same line that might result from stripping dark: classes
    content = re.sub(r' +', ' ', content)
    content = content.replace('className=" ', 'className="')

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")

for directory in directories_to_scan:
    if os.path.exists(directory):
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts'):
                    apply_theme(os.path.join(root, file))

print("Theme update script complete.")
