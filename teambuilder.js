$(document).ready(function() {
  // Load uma.json
  $.getJSON('uma.json', function(data) {
    var umaData = data;
    var availableUmas = [...umaData];

    // Generate the Uma grid
    var umaGrid = $('.uma-grid');
    function generateUmaGrid(searchTerm = '') {
      umaGrid.empty();
      var filteredUmas = availableUmas.filter(uma =>
        uma.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      $.each(filteredUmas, function(index, uma) {
        var umaItem = $('<div class="uma-item" data-url="' + uma.pageUrl + '"></div>');
        var umaImage = $('<img src="' + uma.imageUrl + '" alt="' + uma.name + '">');
        umaItem.append(umaImage);
        umaGrid.append(umaItem);
      });
      makeUmaDraggable();
    }

    generateUmaGrid();

    // Make the Uma items draggable
    function makeUmaDraggable() {
      $('.uma-item').draggable({
        revert: 'invalid',
        containment: 'document',
        helper: 'clone',
        cursor: 'move',
        start: function(event, ui) {
          $(this).hide();
        },
        stop: function(event, ui) {
          if (!ui.helper.hasClass('selected-uma')) {
            $(this).show();
          }
        }
      });
    }

    // Make the category divs droppable
    $('.category').droppable({
      accept: '.uma-item',
      drop: function(event, ui) {
        if ($(this).find('.selected-uma').length < 3) {
          var umaItem = ui.draggable.clone();
          umaItem.removeClass('uma-item').addClass('selected-uma');
          var umaImage = umaItem.find('img').clone();
          $(this).append(umaImage);
          var umaUrl = umaItem.data('url');
          var umaIndex = availableUmas.findIndex(uma => uma.pageUrl === umaUrl);
          availableUmas.splice(umaIndex, 1);
          var searchTerm = $('#searchInput').val();
          generateUmaGrid(searchTerm);
        }
      }
    });

    // Make the selected Uma items draggable back to the grid
    $(document).on('mouseenter', '.selected-uma', function() {
      $(this).draggable({
        revert: 'invalid',
        containment: 'document',
        helper: 'original',
        cursor: 'move',
        start: function(event, ui) {
          $(this).remove();
        },
        stop: function(event, ui) {
          var umaUrl = $(this).parent().data('url');
          var uma = umaData.find(uma => uma.pageUrl === umaUrl);
          availableUmas.push(uma);
          var searchTerm = $('#searchInput').val();
          generateUmaGrid(searchTerm);
        }
      });
    });

    // Reset button click event
    $('#resetButton').click(function() {
      $('.category').empty();
      $('.category').each(function() {
        $(this).append('<h3>' + $(this).data('category') + '</h3>');
      });
      availableUmas = [...umaData];
      $('#searchInput').val('');
      generateUmaGrid();
    });

    // Search input event
    $('#searchInput').on('input', function() {
      var searchTerm = $(this).val();
      generateUmaGrid(searchTerm);
    });

    // Handle form submission
    $('#teamBuilderForm').submit(function(event) {
      event.preventDefault();

      var name = $('#name').val();
      var rank = $('#rank').val();
      var trainerId = $('#trainerId').val();

      var teamDetails = '<h2>Team Details</h2>';
      teamDetails += '<p><strong>Name:</strong> ' + name + '</p>';
      teamDetails += '<p><strong>In-game Rank:</strong> ' + rank + '</p>';
      teamDetails += '<p><strong>Trainer ID:</strong> ' + trainerId + '</p>';

      teamDetails += '<table>';
      teamDetails += '<tr><th>Race Category</th><th>Selected Uma</th></tr>';

      $('.category').each(function() {
        var category = $(this).data('category');
        var selectedUmas = $(this).find('img');

        teamDetails += '<tr>';
        teamDetails += '<td>' + category + '</td>';
        teamDetails += '<td>';

        if (selectedUmas.length > 0) {
          selectedUmas.each(function() {
            var umaUrl = $(this).parent().data('url');
            var umaImage = $(this).clone();
            umaImage.attr('data-url', umaUrl);
            teamDetails += umaImage.prop('outerHTML');
          });
        } else {
          teamDetails += 'N/A';
        }

        teamDetails += '</td>';
        teamDetails += '</tr>';
      });

      teamDetails += '</table>';

      $('#teamDetails').html(teamDetails);

      // Open UmaViewer page when clicking on Uma's picture
      $('#teamDetails img').click(function() {
        var umaUrl = $(this).data('url');
        localStorage.setItem('selectedUmaUrl', umaUrl);
        window.open('umaviewer.html');
      });
    });
  });
});