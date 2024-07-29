import itemData from './item_data.json';

export const getItemByName = (name) => {
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
};

export const getItemById = (id) => {
  const item0 = itemData.find(item => item.id === id);
  if (!item0) {
    console.warn(`Item ${id} not found`);
    return null;
  }
  // for dup issue
  const item = itemData.find(item => item.name === item0.name);
  return item;
}

export const getRawIdById = (id) => {
  const item = getItemById(id);
  if (!item) {
    return null;
  }
  return getItemById(id).raw_id;
}