const pattern = new Uint8Array([176, 173, 1, 0, 1, 255, 255, 255]);
const pattern2 = new Uint8Array([176, 173, 1, 0, 1]);

var tmp;

export function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            var file_read = e.target.result;
            if (!buffer_equal(file_read["slice"](0, 4), new Int8Array([66, 78, 68, 52]))) {
                e.target.result = null;
                $("#slot_select").style.display = "none";
                // alert("Insert a valid file");
                reject();
                return;
            }
            resolve(file_read);
        };
        reader.onerror = e => {
            // error occurred
            console.error("Error : " + e.type);
            reject();
        };
        reader.readAsArrayBuffer(file);
    });
}

function buffer_equal(buf1, buf2) {
    if (buf1.byteLength !== buf2.byteLength) return false;
    const dv1 = new Int8Array(buf1);
    const dv2 = new Int8Array(buf2);
    for (let i = 0; i !== buf1.byteLength; i++) {
        if (dv1[i] !== dv2[i]) return false;
    }
    return true;
}


export function getNames(file_read) {
    const decoder = new TextDecoder("utf-8");
    const name1 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x1901d0e, 0x1901d0e + 32)))));
    const name2 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x1901f5a, 0x1901f5a + 32)))));
    const name3 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x19021a6, 0x19021a6 + 32)))));
    const name4 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x19023f2, 0x19023f2 + 32)))));
    const name5 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x190263e, 0x190263e + 32)))));
    const name6 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x190288a, 0x190288a + 32)))));
    const name7 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x1902ad6, 0x1902ad6 + 32)))));
    const name8 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x1902d22, 0x1902d22 + 32)))));
    const name9 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x1902f6e, 0x1902f6e + 32)))));
    const name10 = decoder.decode(new Int8Array(Array.from(new Uint16Array(file_read.slice(0x19031ba, 0x19031ba + 32)))));

    const names = [name1, name2, name3, name4, name5, name6, name7, name8, name9, name10];
    names.forEach((name, index) => {
        names[index] = name.replaceAll("\x00", "");
    });
    return names;
}

function get_slot_ls(dat) {
    const slot1 = dat.subarray(0x00000310, 0x0028030f + 1);
    const slot2 = dat.subarray(0x00280320, 0x050031f + 1);
    const slot3 = dat.subarray(0x500330, 0x78032f + 1);
    const slot4 = dat.subarray(0x780340, 0xa0033f + 1);
    const slot5 = dat.subarray(0xa00350, 0xc8034f + 1);
    const slot6 = dat.subarray(0xc80360, 0xf0035f + 1);
    const slot7 = dat.subarray(0xf00370, 0x118036f + 1);
    const slot8 = dat.subarray(0x1180380, 0x140037f + 1);
    const slot9 = dat.subarray(0x1400390, 0x168038f + 1);
    const slot10 = dat.subarray(0x16803a0, 0x190039f + 1);
    return [slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9, slot10];
}

function getInventory(slot) {
    let index = subfinder(slot, pattern) + pattern.byteLength + 8;
    let dlcFile = false;

    if (!index) {
        index = subfinder(slot, pattern2) + pattern2.byteLength + 3;
        dlcFile = true;
    }

    const endIndex = subfinder(slot.subarray(index), new Uint8Array(50).fill(0)) + index + 6;
    const inventory = slot.subarray(index, endIndex);

    return { inventory, dlcFile };
}

export function fetchInventory(file_read, selected_slot) {
    const saves_array = new Uint8Array(file_read);
    const slots = get_slot_ls(saves_array);
    const { inventory, dlcFile } = getInventory(slots[selected_slot]);
    let id_list = split(inventory, dlcFile ? 8 : 16);
    id_list = id_list.map(raw_id => getIdReversed(raw_id).toUpperCase());
    return id_list;
}

function subfinder(mylist, pattern) {
    for (let i = 0; i < mylist.byteLength; i++) {
        if (mylist[i] === pattern[0] && buffer_equal(mylist.subarray(i, i + pattern.byteLength), pattern)) return i;
    }
}

function split(list_a, chunk_size) {
    const splitted = [];
    for (let i = 0; i < list_a.length; i += chunk_size) {
        let chunk = list_a.slice(i, i + chunk_size);
        splitted.push(chunk);
    }
    return splitted;
}

function getIdReversed(id) {
    let final_id = "";
    tmp = id.slice(0, 4).reverse();
    for (let i = 0; i < 4; i++) {
        final_id += decimalToHex(tmp[i], 2);
        // final_id += Number(tmp[i]).toString();
    }
    return final_id;
}

function decimalToHex(d, padding) {
    let hex = Number(d).toString(16);
    padding = typeof padding === "undefined" || padding === null ? (padding = 2) : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
}
