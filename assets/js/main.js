import { readFile, getNames, fetchInventory } from "./save.js";

var profiles = JSON.parse(localStorage.getItem("profiles"));
if (profiles === null) {
  profiles = {};
}

var file_read = null;
var item_list = [];
var itemData;
var collectionsData;
var reversedItemIdList;
var selected_slot;
var category_progress = {};

jQuery(document).ready(async function ($) {
  initializeProfile();
  await read_data();
  addChecklist();

  // Load Save Script
  $("#saveLoadBtn").click(function () {
    $("#fileSelector").click();
  });
  $("#fileSelector").change(async function (evt) {
    var file = evt.target.files[0];
    if (file) {
      file_read = await readFile(file);
      var chr_names = getNames(file_read);
      updateSlotDropdown(chr_names);
      $("#slot_selector").change(function(e) {
        // $("#calculate").css("display", "inline-block");
        calculateSave();
      });
    }
  });
});

function initializeProfile() {
  if (!("checklistData" in profiles)) profiles.checklistData = {};
  if (!("current_tab" in profiles)) {
    profiles.current_tab = "#tabItems";
  } else {
    // TBD
  };
  if (!("is_hide_complete" in profiles)) {
    profiles.is_hide_complete = true;
  } else {
    $("#hide_complete").prop("checked", profiles.is_hide_complete);
  };
}

async function read_data() {
  try {
    let res = await fetch("assets/data/item_data.json");
    itemData = await res.json();
    res = await fetch("assets/data/collections.json");
    collectionsData = await res.json();
    reversedItemIdList = genReversedItemIdList(itemData);
  } catch (e) {
    console.log(e);
  }
}

function addChecklist() {
  Object.keys(collectionsData).forEach(function (categoryKey) {
    var categories = collectionsData[categoryKey];
    // Loop over Weapon/Armor/Good/...
    categories.forEach(function (category) {
      console.log(category);

      var category_name = category['name'];
      var category_id = category['id'];
      var category_count = category['items'].length;
      var progress_str = "(0/" + category_count + ")";
      category_progress[category_id] = [0, category_count]

      var summary = `
      <details class="s12" id="` + category_id + `">                    
          <summary class="none">
              <article class="no-elevate">
                  <nav>
                    <div class="max">` + category_name + progress_str + `</div>
                    <i>expand_more</i>
                  </nav>
                  <progress class="max" value="0" max="` +category_count+ `"></progress>
              </article>
          </summary>
        </details>`;
      
      $("#" + categoryKey).append(summary);

      // Loop category items
      var category_items = category['items'];
      category_items.forEach(function (item_name) {
        var item_id = reversedItemIdList[item_name];
        var item = itemData[item_id];
        var tooltips = "物品ID:" + item_id;
        var content = `
          <div class="check_item">
            <label class="checkbox">
                <input type="checkbox" data-id="` + item_id + `">
                <span class="item_content">` + item['name'] + `</span>
            </label>
          </div>`;
        $("#" + category_id + "").append(content);
      })
    });
  });
}


// Load Save
function updateSlotDropdown(slot_name_list) {
    const select = $("#slot_select");
    select.html(`
        <select aria-label="Select slot" id="slot_selector">
            <option hidden selected>选择存档角色</option>
        </select>
        <label>角色栏</label>
        <i>arrow_drop_down</i>`);

    const selector = select.find("select");
    for (let i = 0; i < 10; i++) {
        if (slot_name_list[i] === "") {
            selector.append(`<option value="${i}" disabled> - </option>`);
        } else {
            selector.append(`<option value="${i}"> ${slot_name_list[i]} </option>`);
        }
    }
    select.show();
}

function genReversedItemIdList(itemData) {
  var reversedItemIdList = {};
  for (let key in itemData) {
    let item = itemData[key];
    reversedItemIdList[item.name] = key;
  }
  return reversedItemIdList;
}


async function calculateSave() {
  selected_slot = $("#slot_selector option:selected").val();
  item_list = fetchInventory(file_read, selected_slot);
  console.log(item_list);

  // calculate global progress
  const uniqueRawIds = new Set();
  const counterRawIds = new Set();
  var total = 0;
  var complete = 0;

  // Loop through all items
  for (let key in itemData) {
    let item = itemData[key];
    uniqueRawIds.add(item.id);
    // console.log(item.id);

    if (item_list.includes(item.id) && !counterRawIds.has(item.id)) {
      complete += 1;
      counterRawIds.add(item.id);
    }
  }
  total = uniqueRawIds.size;

  var globalPc = Math.floor((complete / total) * 100); // global progress percentage
  // Print all
  console.log("Total: " + total);
  console.log("Complete: " + complete);
  console.log("Percentage: " + globalPc + "%");

  // Update the progress
  // $("#progress").text(`${globalCounter}/${globalTotal}`);
}