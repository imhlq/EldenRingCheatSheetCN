import { readFile, getNames, fetchInventory, findItemQuantities } from "./save.js";

var profiles = JSON.parse(localStorage.getItem("profiles"));
if (profiles === null) {
  profiles = {};
}
var file_read = null;
var slots = [];
var selected_slot;
var item_list = [];

jQuery(document).ready(async function ($) {
  initializeProfile();

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
  }
  if (!("is_hide_complete" in profiles)) {
    profiles.is_hide_complete = true;
  } else {
    $("#hide_complete").prop("checked", profiles.is_hide_complete);
  }
}

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

function calculateSave() {
  selected_slot = $("#slot_selector option:selected").val();
  item_list, slots = fetchInventory(file_read, selected_slot);
  const itemsQuantities = findItemQuantities(slots[selected_slot]);
  let globalCounter = 0;
  const itemsFound = itemsQuantities.reduce((prev, cur) => prev + cur, 0);
  globalCounter += itemsFound;

  console.log(itemsQuantities);
  console.log(globalCounter);


  // let globalTotal = 0;
  // const totalItems = quantifiableItems.reduce((prev, cur) => prev + cur.places.length, 0);
  // globalTotal += totalItems;

  // Update the progress
  // $("#progress").text(`${globalCounter}/${globalTotal}`);
}