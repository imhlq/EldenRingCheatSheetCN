import json

with open("EldenRingCheatSheetCN\\assets\\data\\walkthrough.json", 'r', encoding='utf-8') as f:
    data = json.load(f)

# Add event_id to each event
event_id = 1
for region in data['regions']:
    for event in region['events']:
        event['event_id'] = "Q" + hex(event_id)[2:].upper()
        event_id += 1

# Convert the modified data back to JSON
updated_json_data = json.dumps(data, indent=2, ensure_ascii=False)

with open("EldenRingCheatSheetCN\\assets\\data\\walkthrough2.json", 'w', encoding='utf-8') as f:
    f.write(updated_json_data)
