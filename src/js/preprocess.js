import itemData from './item_data.json';

// Preprocess the data list
export function processJSON(data, type='names') {
    if (type === 'names') {
        data.forEach(category => {
            category.totalCount = category.items.length;
            category.itemData = category.items
                  .map(name => {
                    const items = itemData.filter(item => item.name === name);
                    if (items.length === 0) {
                        console.warn(`Item ${name} not found`);
                        return undefined;
                    } else if (items.length > 1) {
                        console.warn(`Item ${name} is ambiguous`, items.map(item => item.id));
                    }
                    const item = items[0];
                    try {
                        // set class name for Elden Ring
                        item.class_name = item.type;
                        if (item.is_dlc) {item.class_name += ' dlc01';}
                        if (item.is_legendary) {item.class_name += ' legendary';}
                        if (item.is_cut_content) {item.class_name += ' cut_content';}
                        return item;
                    } catch (e) {
                        console.log(e);
                    }
                  })
                  .filter(item => item !== undefined);
        });
    } else if (type === 'bosses') {
        data.forEach(category => {
            category.totalCount = category.bosses.length;
            category.itemData = category.bosses
                .map(boss => {
                    const item = {};
                    item.name = boss.boss;
                    item.id = boss.flag_id.toString(16).toUpperCase();
                    item.class_name = "boss";
                    return item;
                });
            category.name = category["region_name"]
        })
    } else if (type === 'Walkthrough') {
        data.forEach(category => {
            category.totalCount = category.events.length;
            category.itemData = category.events
                .map(event => {
                    const item = {};
                    item.name = event.text;
                    item.id = stringToHash(event.text);
                    item.class_name = item.class;
                    return item;
                })
        })
    } else if (type === 'Quest') {
        // Walkthrough Version 2
        data.forEach(category => {
            category.totalCount = category.quests.length;
            category.itemData = category.quests
                .map(quest => {
                    const item = {};
                    item.name = quest.text;
                    item.id = quest.quest_id;
                    item.class_name = quest.quest_type;
                    item.side_name = quest.side_name? quest.side_name: null;
                    item.options = quest.options;
                    return item;
                })
        })
    } else if (type === 'Collection') {
        data.forEach(category => {
            category.totalCount = category.items.length;
            category.itemData = category.items
                .map(location => {
                    const item = {};
                    item.name = location;
                    item.id = stringToHash(location);
                    item.class_name = "location";
                    return item;
                })
        })
    }
    return data;
}

// Use to generate unique hash for unstructured data
function stringToHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    // Convert the hash to a Base62 string
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let base62Hash = '';
    const base = characters.length;
    hash = Math.abs(hash);
    while (hash > 0) {
        base62Hash = characters[hash % base] + base62Hash;
        hash = Math.floor(hash / base);
    }

    // Ensure the hash is at least 10 characters long
    base62Hash = base62Hash.padStart(8, 'X').substring(0, 8);
    return base62Hash;
}