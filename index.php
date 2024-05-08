<?php
// Include the Simple HTML DOM Parser library
require_once 'simple_html_dom.php';

// Read the JSON file
$jsonFile = 'character_urls.json';
$jsonData = file_get_contents($jsonFile);
$characterUrls = json_decode($jsonData, true);

// Get the selected character URL from the dropdown
$selectedUrl = isset($_GET['character']) ? $_GET['character'] : '';

// If no character is selected, use the default URL
if (empty($selectedUrl)) {
   $selectedUrl = 'https://gametora.com/umamusume/characters/100103-special-week';
}

// Fetch the HTML content of the selected webpage
$html = file_get_contents($selectedUrl);

// Parse the HTML content
$dom = new simple_html_dom();
$dom->load($html);

// Define the partial class names in the desired order
$partialClasses = [
   'characters_infobox_top',
   'characters_infobox_character_image',
   'characters_infobox_stats'
];

// Initialize an empty array to store the extracted div contents
$extractedContents = array();

// Get the maximum count of div elements matching any partial class
$maxCount = 0;
foreach ($partialClasses as $partialClass) {
   $divs = $dom->find('div[class*="' . $partialClass . '"]');
   $maxCount = max($maxCount, count($divs));
}

// Iterate over the div elements based on the maximum count
for ($i = 0; $i < $maxCount; $i++) {
   // Iterate over the partial class names in the specified order
   foreach ($partialClasses as $partialClass) {
       // Locate the div element at the current index with the current partial class
       $div = $dom->find('div[class*="' . $partialClass . '"]', $i);

       // If a matching div element is found
       if ($div) {
           // Find all elements with the src attribute within the div
           $elements = $div->find('[src]');

           // Iterate over each element with the src attribute
           foreach ($elements as $element) {
               // Get the current src value
               $src = $element->src;

               // Check if the src value is a relative URL
               if (strpos($src, 'http') !== 0) {
                   // Prepend "https://gametora.com/" to the src value
                   $element->src = 'https://gametora.com/' . $src;
               }
           }

           // Extract the modified div content and add it to the array
           $extractedContents[] = $div->innertext;
       }
   }
}
?>

<!DOCTYPE html>
<html>
<head>
   <title>Div Content Extraction</title>
   <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
   <h1>Extracted Div Contents:</h1>
   <form method="get" action="">
       <label for="character">Select a character:</label>
       <select name="character" id="character">
           <?php foreach ($characterUrls as $name => $url) { ?>
               <option value="<?php echo $url; ?>" <?php if ($selectedUrl === $url) echo 'selected'; ?>>
                   <?php echo $name; ?>
               </option>
           <?php } ?>
       </select>
       <button type="submit">Go</button>
   </form>
   <div class="content-wrapper">
       <?php foreach ($extractedContents as $content) { ?>
           <div class="extracted-content">
               <?php echo $content; ?>
           </div>
       <?php } ?>
   </div>
</body>
</html>