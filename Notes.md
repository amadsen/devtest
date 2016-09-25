## Pages

### Article
The main content view in the test - the article has 

+ a sub title
+ a section title
+ a hero image carousel (possibly optional for some content, but assume it is always there)
	+ multiple images (or videos?), assume 2-3
	+ clicking thumbnails switches images
	+ each image has
		+ a title
		+ a caption
+ Content
	+ contains at least one sub heading
+ Related video
	+ potentially optional
	+ plays in place (no resize)
	+ title
	+ caption
	+ assume consistent placement on page

### Tile

+ video
+ category
+ title
+ teaser
+ when played, video shifts from left alignment to full width above full with text content (no other changes.)

### Masonry

+ columnar layout - assume order left to right, then top to bottom (so load more works sensibly)
+ Load More button adds 4 more items, then disappears
+ Masonry Tiles
	+ fixed width
	+ variable height
	+ (optional) image
		+ replaced by red line when no image
	+ title
	+ teaser (multiple paragraphs)

### Tiles / Categorized Tiles (Under headings)

+ categories
	+ Name
	+ Color
	+ Hero Content
		+ Image (or Video)
			+ do we have a consistent aspect ratio?
			+ assume no, if we need responsive
		+ Title
		+ Teaser
		+ Fixed width
		+ Fixed height

## Assumptions

+ Clicking anywhere on a Tile other than a video should load the Article view for that article
+ Clicking on a Category Heading loads Masonry view for that Category
+ Use Tile concepts **within** Categorized Tiles and Masonry
	+ selected Tile moves to hero position (within Category) as others disappear and reappear in masonry below
+ For navigability, add Home link to Categorized Tiles and Category link when on Article page
+ Categorized Tiles is home page

## Strategy

+ sticking with simple HTML, CSS, and minimal client side javascript for intial build out
+ employ react/redux SPA concepts shortly thereafter (because it's better for the Load More, material design transitions of Tiles, and maintainability.)
