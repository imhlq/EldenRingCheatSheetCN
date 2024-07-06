import { readFile, getNames, fetchInventory } from "./save.js";

var profiles = JSON.parse(localStorage.getItem("profiles"));
if (profiles === null) {
  profiles = {};
}

var file_read = null;
var item_list = [];
var itemData;
var collectionsData;
var WalkthroughData;
var ItemIdList = {};
var reversedItemIdList = {};
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
        calculateSave();
      });
    }
  });

  // Tab Switch

  // Checkbox Event
  $("input[type='checkbox']").change(function () {
    var item_id = $(this).data("id");
    var is_checked = (profiles.checklistData[item_id] = $(this).prop("checked"));
    if (is_checked) {
      $(this).parent().addClass("completed");
    } else {
      $(this).parent().removeClass("completed");
    }
    // Update Percent UI
    var currVal = $(this).closest("details").find("progress").val();
    var maxVal = $(this).closest("details").find("progress").attr("max");
    var newVal = is_checked ? currVal + 1 : currVal - 1;
    $(this).closest("details").find("progress").val(newVal); // Update Progress Bar
    $(this).closest("details").find(".ptext").text("(" + newVal + "/" + maxVal + ")"); // Update Progress Text

    localStorage.setItem("profiles", JSON.stringify(profiles));
  })

  resetProgess();

  // Hidden Item Button
  $("#hide_complete").click(function () {
    console.log("hide_complete");
    profiles.is_hide_complete = $(this).prop("checked");
    updateHideCompleted();
    localStorage.setItem("profiles", JSON.stringify(profiles));
  });
  


  // Search Highlight
  var jets = [
    new Jets({
      searchTag: "#walkthrough_search",
      contentTag: "#Walkthrough",
    }),
    new Jets({
      searchTag: "#boss_search",
      contentTag: "#Bosses",
    }),
    new Jets({
      searchTag: "#armor_search",
      contentTag: "#Armor",
    }),
    new Jets({
      searchTag: "#weapon_search",
      contentTag: "#Weapon",
    }),
    new Jets({
      searchTag: "#good_search",
      contentTag: "#Good",
    }),
    new Jets({
      searchTag: "#magic_search",
      contentTag: "#Magic",
    }),
  ];

  $("#weapon_search").on("keyup", function () {
    $("#Weapon").unlightlight();
    $("#Weapon").highlight($(this).val());
  });

  // Save Profile to localStorage
  localStorage.setItem("profiles", JSON.stringify(profiles));

});

function initializeProfile() {
  if (!("checklistData" in profiles)) profiles.checklistData = {};
  if (!("category_progress" in profiles)) profiles.category_progress = {};
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
    genReversedItemIdList(itemData);

    res = await fetch("assets/data/walkthrough.json");
    WalkthroughData = await res.json();
  } catch (e) {
    console.log(e);
  }
}

function addChecklist() {
  // Items
  Object.keys(collectionsData).forEach(function (categoryKey) {
    var categories = collectionsData[categoryKey];
    // Loop over Weapon/Armor/Good/...
    categories.forEach(function (category) {
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
                    <div class="max">` + category_name + ` <span class="ptext">` + progress_str + `</span></div>
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
        var content_class_name = "item_content";
        if (item['is_dlc']) {
          content_class_name += " dlc01";
        };
        if (item['is_legendary']) {
          content_class_name += " legendary";
        };

        var content = `
          <div class="check_item">
            <label class="checkbox">
                <input type="checkbox" data-id="` + item_id + `">
                <span class="` +content_class_name+`">` + item['name'] + `</span>
            </label>
          </div>`;

        $("#" + category_id + "").append(content);

        // Update checked status
        if (profiles.checklistData[item_id]) {
          $('[data-id="' + item_id + '"]').prop("checked", true);
          $('[data-id="' + item_id + '"]').parent().addClass("completed");
        };

      })
    });
  });

  // Walkthrough
  WalkthroughData["regions"].forEach(function (region) {
    var region_name = region['name']
    var region_name_en = region['name_en']
    var summary = `
    <details class="s12" name="` + region_name_en +`">
        <summary class="none">
            <article class="no-elevate">
                <nav>
                  <div class="max">` + region_name + ` <span class="small-text">` +region_name_en+ `</span></div>
                  <i>expand_more</i>
                </nav>
            </article>
        </summary>
      </details>`;
    $("#Walkthrough").append(summary);

    region['events'].forEach(function(event) {
      var content_class_name = "item_content";
      if ("sub_quests" in event && event["sub_quests"]){
        content_class_name += " sub_quests";
      };
      var content = `
          <div class="check_item">
            <label class="checkbox">
                <input type="checkbox" data-id="` + event["event_id"] + `">
                <span class="` +content_class_name+`">` + event['description'] + `</span>
            </label>
          </div>`;
      $("details[name='" + region_name_en + "']").append(content);
      // Update checked status
      if (profiles.checklistData[event["event_id"]]) {
        $('[data-id="' + event["event_id"] + '"]').prop("checked", true);
        $('[data-id="' + event["event_id"] + '"]').parent().addClass("completed");
      };
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
  for (let key in itemData) {
    let item = itemData[key];
    reversedItemIdList[item.name] = key;
    ItemIdList[key] = item.name;
  }
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


  // Reset and Update the progress
  profiles.checklistData = {};
  counterRawIds.forEach(function (item_id) {
    profiles.checklistData[item_id] = true;
    $('[data-id="' + item_id + '"]').prop("checked", true);
    $('[data-id="' + item_id + '"]').parent().addClass("completed");
  })
  resetProgess();
  // $("#progress").text(`${globalCounter}/${globalTotal}`);
}

function updateHideCompleted() {
  const isHidden = profiles.is_hide_complete;
  const displayValue = isHidden ? "none" : "";

  $("label .completed").each(function () {
    $(this).css("display", displayValue);
  });
}

function resetProgess() {
  Object.keys(collectionsData).forEach(function (categoryKey) {
    var categories = collectionsData[categoryKey];
    // Loop over Weapon/Armor/Good/...
    categories.forEach(function (category) {
      var category_id = category['id'];
      var category_count = category['items'].length;
      profiles.category_progress[category_id] = [0, category_count];

      Object.keys(profiles.checklistData).forEach(function (item_id) {
        var item_name = ItemIdList[item_id];
        if (profiles.checklistData[item_id] && category['items'].includes(item_name)) {
          profiles.category_progress[category_id][0] += 1;
        };
      });
    }); 
  });

  // Update UI
  updateProgessUI();
}

function updateProgessUI(){
  Object.keys(category_progress).forEach(function (category_id) {
    var progress = profiles.category_progress[category_id];
    var progress_str = "(" + progress[0] + "/" + progress[1] + ")"; // (complete/total)
    $("#" + category_id + " .ptext").text(progress_str);
    $("#" + category_id + " progress").val(progress[0]);
  });
}