var profiles = JSON.parse(localStorage.getItem("profiles"))
if(profiles === null) {
    profiles = {}
}


jQuery(document).ready(function($) {

    initializeProfile();

    $('ul li[data-id]').each(function() {
        addCheckbox(this);
    });

    $('.checkbox input[type="checkbox"]').click(function() {
        var id = $(this).attr('id');
        var isChecked = profiles.checklistData[id] = $(this).prop('checked');
        if (isChecked === true) {
          $('[data-id="'+id+'"] label').addClass('completed');
        } else {
          $('[data-id="'+id+'"] label').removeClass('completed');
        }
        localStorage.setItem("profiles", JSON.stringify(profiles));
        flesh_hide_completed();
    });

    // List Checkbox
    $('.nav li a').on('click', function(el) {
        profiles.current_tab = $(this).attr('href');
        localStorage.setItem("profiles", JSON.stringify(profiles));
    })

    // Filter Buttons
    $('.btn-group input[type="checkbox"]').click(function() {
        var is_hidden = $(this).is(':checked');
        var item_toggle = $(this).attr('data-bs-toggle')
        $('li.' + item_toggle).each(function(){
            if(!is_hidden){
                $(this).css('display', 'none')
            }else{
                $(this).css('display', '')
            }
        })
    });

    flesh_hide_completed();

    $('#hide_complete').click(function(){
        profiles.is_hide_complete = $(this).is(':checked');
        flesh_hide_completed();
    });


    $('#reset_storage').click(function(){
        clear();
    })

    var jets = [
        new Jets({
          searchTag: '#walkthrough_search',
          contentTag: '#walkthrough_list ul',
        }),
        new Jets({
          searchTag: '#boss_search',
          contentTag: '#boss_list ul',
        }),
        new Jets({
          searchTag: '#armor_search',
          contentTag: '#armor_list ul',
        }),
        new Jets({
          searchTag: '#weapon_search',
          contentTag: '#weapon_list ul',
        }),
      ];
  
  
      $('#walkthrough_search').keyup(function(){
          $('#walkthrough_list').unhighlight();
          $('#walkthrough_list').highlight($(this).val());
      });
  
      $('#boss_search').keyup(function(){
          $('#boss_list').unhighlight();
          $('#boss_list').highlight($(this).val());
      });
  
      $('#armor_search').keyup(function(){
          $('#armor_list').unhighlight();
          $('#armor_list').highlight($(this).val());
      });
  
      $('#weapon_search').keyup(function(){
          $('#weapon_list').unhighlight();
          $('#weapon_list').highlight($(this).val());
      });
  
})

function exportStorage(){
    var eleLink = document.createElement('a');
    eleLink.download = "您的缓存.txt";
    eleLink.style.display = 'none';
    var blob = new Blob([localStorage.getItem("profiles")]);
    eleLink.href = URL.createObjectURL(blob);
    document.body.appendChild(eleLink);
    eleLink.click();
    document.body.removeChild(eleLink);
}

function importStorage(){
    var temp =  prompt("请把您的缓存整个粘贴进来","输入奇怪的东西可能导致本地缓存丢失，若有问题请重置（删除本段文字）");
    localStorage.clear();
    profiles = JSON.parse(temp);
    localStorage.setItem("profiles", JSON.stringify(profiles));
    location.reload();
}

function initializeProfile() {
    if(!('checklistData' in profiles))
        profiles.checklistData = {};
    if(!('current_tab' in profiles)){
        profiles.current_tab = '#tabItems'
    } else {
        $('[href="' + profiles.current_tab + '"]').tab('show');;
    }
    if(!('is_hide_complete' in profiles)){
        profiles.is_hide_complete = true
    } else {
        $('#hide_complete').prop('checked', profiles.is_hide_complete);
    }
}

function addCheckbox(el) {
    var $el = $(el);
    var content = $el.html().split('\n')[0];
    content = 
        '<div class="checkbox">' +
            '<label>' +
                '<input type="checkbox" id="' + $el.attr('data-id') + '">' +
                '<span class="item_content">' + content + '</span>' +
            '</label>' +
        '</div>';
    $el.html(content).append($el.children('ul'));

    if (profiles.checklistData[$el.attr('data-id')]===true) {
        $('#' + $el.attr('data-id')).prop('checked', true);
        $('label', $el).addClass('completed');
    }
}

function clear() {
    localStorage.clear();
}



function category_toggle() {
    var is_hidden = $(this).is(':checked')
    var item_toggle = $(this).cloest('.btn-group').find('[data-item-toggle]')
    if (is_hidden ) {
        item_toggle.not(function(){return this.checked === is_hidden}).click()
    }
}

function flesh_hide_completed() {
    var is_hidden = profiles.is_hide_complete;
    // $('#hide_complete').is(':checked');
    $('li .completed').each(function(){
        if(!is_hidden){
            $(this).css('display', 'none')
        }else{
            $(this).css('display', '')
        }
    })
    profiles.is_hide_complete = is_hidden;
    localStorage.setItem("profiles", JSON.stringify(profiles));
}