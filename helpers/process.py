import re
import json

def convert_custom_marks(text):
    custom_marks = [
        (r'=(.*?)=', r"<span class='grace'>\1</span>"),       # Equal signs
        (r'\*\*(.*?)\*\*', r"<span class='npc'>\1</span>"),   # Double asterisks
        (r'\*(.*?)\*', r"<span class='item'>\1</span>"),      # Single asterisk
    ]
    # Replace custom marks with HTML tags
    for mark, html_tag in custom_marks:
        text = re.sub(mark, html_tag, text, flags=re.DOTALL)

    return text

def string_to_hash(s):
    hash_value = 0
    for char in s:
        hash_value = (31 * hash_value + ord(char)) & 0xFFFFFFFF  # Mimicking 32-bit overflow

    characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    base62_hash = ''
    base = len(characters)
    hash_value = abs(hash_value)
    
    while hash_value > 0:
        base62_hash = characters[hash_value % base] + base62_hash
        hash_value //= base
    
    # Ensure the hash is at least 8 characters long
    base62_hash = base62_hash.rjust(8, 'X')[:8]
    return str(base62_hash)

def parse_markdown(markdown_text):
    region_pattern = re.compile(r'## (.+)')
    quest_pattern = re.compile(r'（(.+?)支线）')
    
    regions = []
    current_region = None
    
    lines = markdown_text.split("\n")
    for line in lines:
        line = line.strip()
        if line == "": continue
        
        print(line)
        region_match = region_pattern.match(line)
        quest_match = quest_pattern.search(line)
        
        if region_match:
            if current_region:
                regions.append(current_region)
            current_region = {
                "name": region_match.group(1),
                "quests": [],
            }
        
        elif quest_match and current_region:
            side_name = quest_match.group(1)
            quest_text = convert_custom_marks(line.replace(quest_match.group(0), ""))
            options = []
            quest_id = str(f"{string_to_hash(quest_text)}"),
            current_region['quests'].append({
                "quest_id": quest_id[0],
                "quest_type": "side",
                "side_name": side_name,
                "text": quest_text,
                "options": options,
            })
            
        elif current_region:
            quest_text = convert_custom_marks(line)
            options = []
            quest_id = str(f"{string_to_hash(quest_text)}"),
            current_region['quests'].append({
                "quest_id": quest_id[0],
                "quest_type": "main",
                "text": quest_text,
                "options": options,
            })
            print(quest_text)
            
    if current_region:
        regions.append(current_region)

    return regions

with open("./guide.md", 'r') as f:
    markdown_text = f.read()

df = parse_markdown(markdown_text)
with open("./guide.json", 'w', encoding='utf8') as f:
    json.dump(df, f, indent=2, ensure_ascii=False)