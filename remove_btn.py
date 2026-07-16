import glob
import re

html_files = glob.glob('*.html')

search_pattern = re.compile(r'<a href="index.html" class="mobile-nav-back-btn"[^>]*>.*?</a>\s*', re.DOTALL)

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    if search_pattern.search(content):
        new_content = search_pattern.sub('', content)
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Removed from {file}")
    else:
        print(f"Pattern not found in {file}")
