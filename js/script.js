/* Author: Joseph McCullough (@joe_query)

*/

$(window).load(function(){
	//$('#slideshow_wrapper').append('<div id="slideshow_nav"><ul><li class="slideNavActive">1</li><li>2</li><li>3</li></ul></div>');
	
	var slideshow = new Slaveshow("#slideshow",{
		entrance: {speed: 500},
		exit: {speed: 500},
		duration: 3000,
		transition: "fade",
		nav: $("#slideNav li"),
		left: $("#left"),
		right: $("#right")
	});

	slideshow.animate();

	var slideshowDiv = $("#slideshow");
	var slideshowWrapper = $("#slideshow_wrapper");
	var slides = $(slideshowDiv).children();

	$(window).resize(function(){
		resizeSlideshow();
	});

	function resizeSlideshow(){
		slides.width( slideshowDiv.innerWidth() );
		slideshowWrapper.height( slides.innerHeight() );
		slides.not(".active").css('left', '-9999px');
	}


	resizeSlideshow();

}); //End jQuery
