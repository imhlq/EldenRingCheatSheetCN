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
        console.log(is_hidden)
        console.log(item_toggle)
    })
})

function initializeProfile() {
    if(!('checklistData' in profiles))
        profiles.checklistData = {};
    if(!('current_tab' in profiles)){
        profiles.current_tab = '#tabItems'
    } else {
        $('[href="' + profiles.current_tab + '"]').tab('show');;
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