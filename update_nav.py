import glob
import re

html_files = glob.glob('*.html')

search_pattern = re.compile(r'(<div class="mobile-nav" id="mobileNav">\s*<div class="mobile-nav-links">)', re.MULTILINE)

replace_pattern = r'''<div class="mobile-nav" id="mobileNav">
    <a href="index.html" class="mobile-nav-back-btn">Back</a>
    <div class="mobile-nav-links">'''

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    if search_pattern.search(content):
        new_content = search_pattern.sub(replace_pattern, content)
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Updated {file}")
    else:
        print(f"Pattern not found in {file}")
