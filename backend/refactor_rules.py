import re

path = r'c:\Users\USER\Desktop\car\backend\app\core\rules_engine.py'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Change NDPA-2023-Art to NDPA-2023-Sec
text = re.sub(r'NDPA-2023-Art', 'NDPA-2023-Sec', text)

# Change Article X to Section X
text = re.sub(r'\bArticle (\d+)\b', r'Section \1', text)
text = re.sub(r'\bArticles (\d+)', r'Sections \1', text)

# Change GAID references correctly
text = text.replace('GAID Section 4', 'GAID Article 17')
text = text.replace('GAID Section 6', 'GAID Article 27')
text = text.replace('GAID Section 8', 'GAID Article 37')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Rules engine refactored successfully.")
