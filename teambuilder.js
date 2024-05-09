$(document).ready(function() {
  // Load uma.json when the document is ready
  $.getJSON('uma.json', function(data) {
    var umaData = data;
    var availableUmas = [...umaData];

    // Generate the Uma grid
    var umaGrid = $('.uma-grid');
    function generateUmaGrid(searchTerm = '') {
      // Clear the existing grid
      umaGrid.empty();

      // Filter the Uma data based on the search term
      var filteredUmas = availableUmas.filter(uma =>
        uma.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Generate and append the Uma items to the grid
      $.each(filteredUmas, function(index, uma) {
        var umaItem = $('<div class="uma-item"></div>');
        var umaImage = $('<img src="' + uma.imageUrl + '" alt="' + uma.name + '" data-url="' + uma.pageUrl + '">');
        umaItem.append(umaImage);
        umaGrid.append(umaItem);
      });

      // Make the Uma items draggable
      makeUmaDraggable();
    }

    // Initial grid generation
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
        // Check if the category has less than 3 selected Umas
        if ($(this).find('.selected-uma').length < 3) {
          var umaItem = ui.draggable.clone();
          umaItem.removeClass('uma-item').addClass('selected-uma');
          var umaImage = umaItem.find('img').clone();
          $(this).append(umaImage);

          // Get the URL of the dropped Uma
          var umaUrl = umaImage.data('url');

          // Remove the dropped Uma from the available Umas
          var umaIndex = availableUmas.findIndex(uma => uma.pageUrl === umaUrl);
          availableUmas.splice(umaIndex, 1);

          // Re-generate the Uma grid with the updated available Umas
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

          // Re-generate the Uma grid with the updated available Umas
          var searchTerm = $('#searchInput').val();
          generateUmaGrid(searchTerm);
        }
      });
    });

    // Reset button click event
    $('#resetButton').click(function() {
      // Reset the form and show it again
      $('#teamBuilderForm')[0].reset();
      $('#teamBuilderForm').show();
      $('#buttonContainer').hide();

      // Reset the available Umas and clear the search input
      availableUmas = [...umaData];
      $('#searchInput').val('');

      // Clear the categories
      $('.category').empty();
      $('.category').each(function() {
        $(this).append('<h3>' + $(this).data('category') + '</h3>');
      });

      // Re-generate the Uma grid with the reset data
      generateUmaGrid();

      // Clear the team details
      $('#teamDetails').empty();
    });

    // Search input event
    $('#searchInput').on('input', function() {
      var searchTerm = $(this).val();
      generateUmaGrid(searchTerm);
    });

    // Handle form submission
    $('#teamBuilderForm').submit(function(event) {
      event.preventDefault();

      // Hide the form and show the buttons
      $(this).hide();
      $('#buttonContainer').show();

      // Get the form values
      var name = $('#name').val();
      var rank = $('#rank').val();
      var trainerId = $('#trainerId').val();

      // Get the current date and time
      var currentDateTime = new Date().toLocaleString();

      // Create the team details HTML
      var teamDetails = '<h2>Team Details</h2>';
      teamDetails += '<p><strong>Name:</strong> ' + name + '</p>';
      teamDetails += '<p><strong>In-game Rank:</strong> ' + rank + '</p>';
      teamDetails += '<p><strong>Trainer ID:</strong> ' + trainerId + '</p>';
      teamDetails += '<p><strong>Submission Date and Time:</strong> ' + currentDateTime + '</p>';

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
            var umaUrl = $(this).data('url');
            var umaName = $(this).attr('alt');
            var umaImage = $(this).clone();
            umaImage.attr('data-url', umaUrl);
            teamDetails += '<div class="uma-details">' + umaImage.prop('outerHTML') + '<span>' + umaName + '</span></div>';
          });
        } else {
          teamDetails += 'N/A';
        }

        teamDetails += '</td>';
        teamDetails += '</tr>';
      });

      teamDetails += '</table>';

      // Display the team details
      $('#teamDetails').html(teamDetails);

      // Open UmaViewer page when clicking on Uma's picture
      $('.uma-details img').click(function() {
        var umaUrl = $(this).data('url');
        window.open(`umaviewer.html?umaUrl=${encodeURIComponent(umaUrl)}`);
      });
    });

    // Generate team JSON data
    function generateTeamJSON() {
      var teamData = {
        name: $('#name').val(),
        rank: $('#rank').val(),
        trainerId: $('#trainerId').val(),
        submissionDateTime: new Date().toLocaleString(),
        categories: []
      };

      $('.category').each(function() {
        var category = $(this).data('category');
        var selectedUmas = $(this).find('img').map(function() {
          return {
            url: $(this).data('url'),
            name: $(this).attr('alt'),
            imageUrl: $(this).attr('src')
          };
        }).get();

        teamData.categories.push({
          name: category,
          umas: selectedUmas
        });
      });

      return JSON.stringify(teamData, null, 2);
    }

    // Download team data as JSON file
    $('#downloadButton').click(function() {
      var teamJSON = generateTeamJSON();
      var blob = new Blob([teamJSON], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'team_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
});