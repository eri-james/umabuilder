$(document).ready(function() {
  // Load uma.json
  $.getJSON('uma.json', function(data) {
    var characterData = data;

    // Populate the dropdown list with character names
    $.each(characterData, function(index, character) {
      $('#character').append(`<option value="${character.pageUrl}">${character.name}</option>`);
    });

    // Check if a default Uma URL is stored in localStorage
    var defaultUrl = localStorage.getItem('selectedUmaUrl');
    if (defaultUrl) {
      fetchAndExtractContent(defaultUrl);
      localStorage.removeItem('selectedUmaUrl');
    } else {
      // Fetch and extract content for the default URL on page load
      defaultUrl = 'https://gametora.com/umamusume/characters/100103-special-week';
      fetchAndExtractContent(defaultUrl);
    }
  });

  // Handle form submission
  $('form').submit(function(event) {
    event.preventDefault();
    var selectedUrl = $('#character').val();
    fetchAndExtractContent(selectedUrl);
  });

  // Fetch and extract content from the selected URL
  function fetchAndExtractContent(url) {
    $.get(url, function(html) {
      var $html = $(html);
      var extractedContents = [];

      var partialClasses = [
        'characters_infobox_top',
        'characters_infobox_character_image',
        'characters_infobox_stats'
      ];

      var maxCount = Math.max(...partialClasses.map(partialClass => $html.find(`div[class*="${partialClass}"]`).length));

      for (var i = 0; i < maxCount; i++) {
        partialClasses.forEach(function(partialClass) {
          var $div = $html.find(`div[class*="${partialClass}"]`).eq(i);
          if ($div.length) {
            $div.find('[src]').each(function() {
              var $element = $(this);
              var src = $element.attr('src');
              if (!src.startsWith('http')) {
                $element.attr('src', 'https://gametora.com/' + src);
              }
            });
            extractedContents.push($div.html());
          }
        });
      }

      // Display the extracted contents
      var $contentWrapper = $('.content-wrapper');
      $contentWrapper.empty();
      extractedContents.forEach(function(content) {
        $contentWrapper.append(`<div class="extracted-content">${content}</div>`);
      });
    });
  }
});