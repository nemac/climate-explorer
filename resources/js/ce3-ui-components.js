
  // function enables custom selection dropdown from a li element
  function enableCustomSelect(uniqueSelector) {
    const $styledSelect = $(`.select.${uniqueSelector} div.select-styled`);

    // if disabled exit and do not enable pulldown
    if ( $styledSelect.hasClass( 'disabled' )){
      return null;
    }


    // enable click and show options
    $styledSelect.click(function(e) {
      e.stopPropagation();
      $(`.select.${uniqueSelector} div.select-styled.active`).not(this).each(function(){
        $(this).removeClass('active').next('ul.select-options').hide();
      });
      $(this).toggleClass('active').next('ul.select-options').toggle();
    });

    // get list tiems so we can add user interactions
    var $list = $(`.select.${uniqueSelector} ul`);
    var $listItems = $(`.select.${uniqueSelector} ul`).children('li');

    // enable click for options
    $listItems.click(function(e) {

      // check if disabled exit if it is
      if ($(this).hasClass('default-select-option-disabled')) {return null}

      e.stopPropagation();

      // option item has href make it a element so links work
      var hrefAttr = $(this).attr('href');
      if (typeof hrefAttr !== typeof undefined && hrefAttr !== false) {
        $styledSelect.html(`<a href="${hrefAttr}" rel="${$(this).attr('rel')}">${$(this).text()}</a>`).removeClass('active');
      } else {
        $styledSelect.text($(this).text()).removeClass('active');
      }

      $styledSelect.attr('rel',$(this).attr('rel'))

      // option item has icon add it
      var iconAttr = $(this).attr('icon');
      if (typeof iconAttr !== typeof undefined && iconAttr !== false) {
        // Element has this attribute
        var icon = `<i class="${iconAttr}"></i>`;
      } else {
        var icon = '';
      }

      $styledSelect.prepend(icon);
      $list.hide();
      // trigger custom event so we know the user changed or selected an item
      $styledSelect.trigger('cs-changed' );
    });

    // hide pulldown when user clicks anywhere outside of selected area
    $(document).click(function() {
      $styledSelect.removeClass('active');
      $list.hide();
    });
  }


  // function changes button to selected
  function toggleButton(selector){
    toggleAllButtonsOff(selector.get())
    $(selector).addClass('btn-default-selected');
  }

  // function changes button to selected
  function toggleAllButtonsOff(btnElem){
    const parentElem = btnElem[0].parentElement;
    const elems = parentElem.childNodes;
    elems.forEach((elem) => {
      if (elem instanceof Element) {
        elem.classList.remove('btn-default-selected');
        elem.classList.add('btn-default');
      }
    });
  }

  // update select text
  function setSelectFromButton(target) {
    const innerText = target.html().trim();
    const val = target.attr('val');
    const selector = target.attr('sel');

    $(`#${selector}`).text(innerText);
    $(`#${selector}`).attr('rel', val);
  }

  // eanbles time chart, map click events
  $('#chartmap-wrapper').click( function(e) {
    const target = $(e.target);

    // toggle button visual state
    toggleButton($(target));

    // change select pulldowns for resposnive mode
    setSelectFromButton(target);
  })
