import glob
import re

html_files = glob.glob('*.html')

search_pattern = re.compile(r'<!-- Mobile Menu Toggle -->\s*<button class="mobile-menu-toggle" id="menuToggle" aria-label="Toggle Menu">\s*<span></span>\s*<span></span>\s*<span></span>\s*</button>', re.MULTILINE)

replace_pattern = '''<!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" id="menuToggle" aria-label="Toggle Menu">
        <div class="hamburger-lines">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="menu-toggle-text"></span>
      </button>'''

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
