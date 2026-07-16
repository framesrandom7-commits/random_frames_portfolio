import glob
import re

html_files = glob.glob('*.html')

search_pattern = re.compile(r'<a href="index.html" class="mobile-nav-back-btn">Back</a>', re.MULTILINE)

replace_pattern = r'''<a href="index.html" class="mobile-nav-back-btn" aria-label="Back to Home">
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </a>'''

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
