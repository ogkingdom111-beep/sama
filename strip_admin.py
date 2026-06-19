import re

with open('deepseek_html_20260619_1557cd.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove SheetJS script
content = re.sub(r'<!-- ===== SheetJS.*?</script>\s*', '', content, flags=re.DOTALL)

# 2. Remove Admin CSS
content = re.sub(r'/\* =+ \n\s*ADMIN UPLOAD SECTION.*?(?:/\* =+|\Z)', '/* ============================================================\n', content, flags=re.DOTALL)

# 3. Remove Admin HTML
content = re.sub(r'<!-- ===== ADMIN: رفع ملف الإكسل ===== -->\s*<section class="admin-section">.*?</section>\s*', '', content, flags=re.DOTALL)

# 4. Remove Admin JS DOM variables
content = re.sub(r'// Admin\s*const adminToggle = .*?const uploadStatus = .*?;\s*', '', content, flags=re.DOTALL)

# 5. Remove Admin JS Logic
content = re.sub(r'// =+\n\s*// 8\.  رفع ملف الإكسل \(Admin\).*?// =+\n\s*// 10\..*?\(تم بالفعل عرض idleMessage\)\s*', '', content, flags=re.DOTALL)

# 6. Remove remaining console.logs about Excel
content = re.sub(r"console\.log\('\[System\] البيانات التجريبية:'.*?;\s*", "", content, flags=re.DOTALL)
content = re.sub(r"console\.log\('\[System\] أعمدة الإكسل المطلوبة:'.*?;\s*", "", content, flags=re.DOTALL)

with open('deepseek_html_20260619_1557cd.html', 'w', encoding='utf-8') as f:
    f.write(content)

