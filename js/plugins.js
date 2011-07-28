
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  arguments.callee = arguments.callee.caller;  
  if(this.console) console.log( Array.prototype.slice.call(arguments) );
};
// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();)b[a]=b[a]||c})(window.console=window.console||{});


// place any jQuery/helper plugins in here, instead of separate, slower script files.

//-------------------------------Function isset-------------------------------//
// Purpose: Determines if a variable has been set/initialized
// PARAMETERS:
// 		Var: A variable of any type.
// Postcondition: Returns boolean true if the variable is set. False otherwise.
//----------------------------------------------------------------------------//
function isset(Var){
	return !(typeof Var == 'undefined' || Var === null  || Var === "");
}

(function(jQuery){
//--------------------------------plugin equalTo------------------------------//
// Description: Determines the equality of 2 jQuery objects.
// PARAMETERS:
//		obj;     //The jQuery object being compared
// Postcondition: Returns boolean true if objects are equal. False if not.
//----------------------------------------------------------------------------//
jQuery.fn.equalTo = function(obj){
	return !jQuery(this).not( jQuery(obj) ).length;
};

//------------------------------plugin arrayShift-----------------------------//
// Description: Takes an index of an array, places it at
// another index, and shifts the rest of the array into place
// PARAMETERS:
//		 index;       //The index being moved
//		 newLocation; //The new index of index
// Postcondition: returns an altered jQuery object
//----------------------------------------------------------------------------//
jQuery.fn.arrayShift = function(index, newLocation){
	//Copy all matched elements of the jQuery object to an array
	var tempArr = jQuery.makeArray(jQuery(this));	
	
	//Loop through arguments and convert strings into integers.
	for(var i=0; i<arguments.length; i++){
		if(isNaN(arguments[i])){
			if(arguments[i] == "first"){
				//The first index of the array
				arguments[i] = 0;
			}
			else if (arguments[i] == "last"){
				//The last index of the array
				arguments[i] = tempArr.length-1;
			}
		}
		else{
			arguments[i] = parseInt(arguments[i], 10);
		}
	}
	
	
	//Create a temporary copy of array[index]
	var tempVal = tempArr[index];
	
	if(index > newLocation){
		
		//For every index starting from [index] until (but not including)
		//the index newLocation, Copy the value of the previous index to the 
		//current index
		for(i=index; i>newLocation; i--){
			tempArr[i] = tempArr[i-1];
		}
		
		//Copy the stored value to the newLocation index
		tempArr[newLocation] = tempVal;
		
	}
	else if(index < newLocation){
		//For every index starting from [index] up until (but not including)
		//[newLocation], copy the value of the next index into the current index.
		for(i=index; i<newLocation; i++){
			tempArr[i] = tempArr[i+1];
		}
		
		//Copy the stored value to the newLocation index
		tempArr[newLocation] = tempVal;		
	}
	
	return jQuery(tempArr);
};
//------------------------------plugin fakeFloat------------------------------//
// Description: Aligns elements in a jQuery object based on their index 
// PARAMETERS:
//	options;  //Object that contains settings
//         margin: The margin/blank space between each element in pixels
//         offset: The initial offset in pixels
// Postcondition: Performs an animation
//----------------------------------------------------------------------------//
jQuery.fn.fakeFloat = function(options){
	
	var defaults = {
	margin: 0,
	offset: 0,
	},
	settings = jQuery.extend(defaults, options);  
		
	//Initialize counter
	var i=0;
	
	//Initialize element width
	var elemWidth = 0;
	
	jQuery(this).each(function(){
		elemWidth = jQuery(this).width();
		
/*
 * Consider three 100px width boxes we want to fakeFloat left with 10px between 
 * and with a 5px offset. (Remember the 'left' property is in reference to the
 * left-most portion of the box)
 
    ____________________     ____________________      ___________________
	|                   |    |                   |    |                   |
	| (100+10)*0+5 == 5 |    | (100+10)*1+5==115 |    | (100+10)*2+5==225 |   
	|___________________|(10)|___________________|(10)|___________________|(10)
   ____________________________________________________________________________
     5                       115                      225             
 */

		var newLoc = ((settings.margin) + elemWidth)*i + (settings.offset) 

		//.css doesn't work as well for this, probably due to the queue.
		jQuery(this).animate({"left": newLoc}, 0);

		i++;
	});
	return this;
	
};

//------------------------------plugin getIndexOf-----------------------------//
// Description: Retrieves the relative index of an object within a jQuery 
//              object.
// PARAMETERS:
//		jQobj;     //The jQuery object being searched through
// Postcondition: Returns an integer corresponding to the location of the 
//                object; if nothing is found, returns boolean false.
//----------------------------------------------------------------------------//
jQuery.fn.getIndexOf = function(jQobj){
	//Assume value isn't found
	var index = false;
	
	//Define scope
	var value = jQuery(this);
	
	//Initiate index counter
	var i=0;
	jQuery(jQobj).each(function(){
		if(jQuery(this).equalTo(jQuery(value))){
			index = i;
		}
		
		//Increment index counter
		i++;
	});
	
	return index;
};

})(jQuery); //End jQuery

//--------------------------------------------------------------------
//File: slaveshow.min.js
//Author: Joseph McCullough. 
//		  http://vertstudios.com/
//		  @Joe_query
//Purpose: Executes a slideshow with optional slaves that follow suit.
//         Features include next, previous, and navigation.
//Last Updated: November 14, 2010
//--------------------------------------------------------------------

function Slaveshow(id, options){
	/**
	---------------------------------------- User defined variables ---------------------------------------------
			id: jQuery id of the slideshow container
	    slides: jQuery object that represents the elements that will serve as slides.
	  duration: How long each slide will remain visible assuming no interruption.
	transition: The time between the previous slide's exit and the next slide's entrance.
	    cycles: How many times the slideshow will cycle through assuming no interruption. 
	     delay: How long to offset a slave slideshow from the main slideshow.
	    slaves: An array of slave slideshows that will mimic the main slideshow.
	       nav: jQuery object that represents the elements that will serve as the slide navigation.
	      left: jQuery object that represents the element(s) that will cause the slideshow to carousel left.
	     right: jQuery object that represents the element(s) that will cause the slideshow to carousel right.
	-------------------------------------------------------------------------------------------------------------		 
	**/	
	
	//Initialize default values
	var defaults = {
	 container: jQuery(id),
 	    slides: jQuery(id).children(),		
	  duration: 3000,   			
	transition: 500, 
	    slaves: [],
	     delay: 0,          			
	    cycles: 10          		    
	},	defaultSettings = jQuery.extend(defaults, options);  
	
	/**
	---------------------------------Global variable object---------------------------------
	     animating: Boolean flag that describes the animating state of the slideshow.
	   navSelected: Boolean flag that describes if a navigational element has been selected.
	  navAnimating: Counter that tracks the number of slideshows animating when a
    			    navigational element is clicked.
   	 relativeIndex: The relative index of a slide within the jQuery object
	   activeIndex: The absolute index of the slide being displayed.
	slidesTemplate: Serves as a template for searching for slides
	 numSlideShows: The number of slideshows: main + all slaves
	     numSlides: The number of slides each slideshow contains. 
		totalDelay: The accumulated delay values between all slideshow instantiations
   defaultEntrance: The default entrance animation
       defaultExit: The default exit animation
	----------------------------------------------------------------------------------------
	**/

	var global = {
	animating: false,
	navSelected: false,
	numAnimating: 0,
	relativeIndex: 0,
	activeIndex: 0,
	slidesTemplate: jQuery(defaultSettings.slides),
	numSlideShows: 0,
	numSlides: jQuery(defaultSettings.slides).length,
	totalDelay: 0,
	defaultEntrance: {animation: "fadeIn", speed:500},
	defaultExit: {animation: "fadeOut", speed:500}
	};
	
	//-------------------------------Class slideshow-------------------------------//
	//Description: Establishes the structure of an individual slideshow.
	//PARAMETERS: 
	//container: A jQuery object that holds the selector for the slideshow container.
	//-----------------------------------------------------------------------------//s
	function slideshow(properties){         		
		//Get most default settings
		for(var i in defaultSettings){
			this[i] = (isset(properties[i])) ? properties[i] : defaultSettings[i];
		}	
		
		//Override default settings that are specific to context
		this.container = jQuery(properties.container);
		this.slides = jQuery(properties.container).children();
		
	
		//--------------------------------------------------------------------------------
		//----------------------------Animation initialization----------------------------
		//--------------------------------------------------------------------------------
			//If this is the main slideshow, which is instantiated first
			if(global.numSlideShows == 0){
				//Entrance and exit default objects must be declared in this scope since
				//an object in the defaultSettings objectwill be completely overwritten 
				//when the plugin is called.
				this.entrance = global.defaultEntrance;
				this.exit = global.defaultExit;		
			}
			
			//If not the main slideshow, copy the default values from the main slideshow, 
			//previously instantiated.
			else{	
				//Must create a clone of the objects instead of a direct assignment
				//since JavaScript would treat this.entrance/exit as a pointer to their
				//respective objects, thus altering the values of previous instantiations.
				//Ultimately, each instantiation would be equal to the last instantiation.
				this.entrance = jQuery.extend(true, {}, slideshowArray.main.entrance);
				this.exit = jQuery.extend(true, {}, slideshowArray.main.exit);
			}		

			//Override default animation settings if specified		
			if(isset(properties.entrance)){
				for(var i in this.entrance){
					this.entrance[i] = properties.entrance[i] || this.entrance[i];
				}		
			}
			
			if(isset(properties.exit)){
				for(var i in this.exit){
					this.exit[i] = properties.exit[i] || this.exit[i];
				}
			}
		//--------------------------------------------------------------------------------
			
		//Keep certain values positive.
		this.cycles = Math.abs(this.cycles);
		this.delay = Math.abs(this.delay);
		this.duration = Math.abs(this.duration);
		
		//Check for String in transition and assign respective values
		if(this.transition.constructor == String){
			switch(this.transition){
				case "fade": 
					this.transition = -1 * (this.entrance.speed + this.exit.speed);
					break;
				case "none":
					this.transition = 0;
					break;
				
				default:
					this.transition = 250;				
			}
		}
		
		
		//Increment the number of slideshows for each instantiation of the slideshow class.
		global.numSlideShows++;		
		
		//Accumulate the total delay value
		global.totalDelay += this.delay;
	}
	
	//----------------------------Class slideshow prototype: displaySlide----------------------------//
	//Description: Exits one slide and enters another.
	//PARAMETERS:
	//newRelativeIndex: The index of the slide that will enter in relation to its position in the
    //                  jQuery object. (This index is dynamic due to how jQuery treats a jQuery
	//                  object that has been rearranged.)
	//newActiveIndex:   The index of the slide that will enter in relation to its absolute position
	//                  in the sequence of slides.
	//Postcondition:    Visually, a new slide appears if the proper conditions are met. 
	//					global.activeIndex variable is altered                   
	//                  global.animating alternates between true and false
	//                  The following classes are distributed to the nav elements (if defined):
	//						slideNavUnclickable: slideshow is under animation, can't be interrupted
	//						slideNavActive: applied to nav element that correlates with active slide
	//						slideNavActiveUnclickable: Combination of the two above	
	//-----------------------------------------------------------------------------------------------//
	slideshow.prototype.displaySlide = function(newRelativeIndex, newActiveIndex){	
		//Establish scope
		var $this = this;
		
		//Set the new active index.
		global.activeIndex = newActiveIndex;
					
		//Index [0] belongs to the slide currently displayed. We don't want the animation to occur if the 
		//selected slide is currently on display. If numAnimating is less than numSlideshows, then a
		//slideshow can animate.
		if(newRelativeIndex !=0 && (global.numAnimating < global.numSlideShows)){				
			//The slideshow is animating. Prevent unnecessary reassignment, since global.animating will
			//remain true until the all slideshows have finished animating.
			if(global.numAnimating == 0)
				global.animating = true;
			
			setTimeout(function(){
				//Select first slide and exit it
				$this.firstSlide = jQuery($this.slides[0]);				
				$this.doTransition($this.firstSlide, $this.exit);
														
				//Array shift until the selected slide is at the front of the jQuery object (at index[0]).
				for(var i=0; i<newRelativeIndex; i++){ 
				   $this.slides = jQuery($this.slides).arrayShift("first","last");
				}
				
				if(isset(defaultSettings.nav)){
					//Remove active class from any nav elements and show nav elements as unclickable during animation
					jQuery(defaultSettings.nav).removeClass('slideNavActive').addClass('slideNavUnclickable');
									
					//Determine which slide is active, and give the active class to the corresponding nav element
					jQuery(defaultSettings.nav).eq(newActiveIndex).addClass('slideNavActive slideNavActiveUnclickable');

					// Add active class to active slide. Remove from inactive slides
					jQuery(defaultSettings.slides).removeClass('active').eq(newActiveIndex).addClass('active');

				}				
			}, $this.delay);
			
			setTimeout(function(){									
				//Hide the NEW first slide. We do this so the slide will be able to execute
				//its entrance animation. Without the slide hidden, it would just
				//appear without animation
				$this.firstSlide = jQuery($this.slides[0]).hide();
					
				//Rearrange all the slides.
				jQuery($this.slides).fakeFloat();
					
				//Erase the display:none that may be on the previously animated slide
				jQuery($this.slides).slice(1).show(0);					
				
				//Enter the new slide
				$this.doTransition($this.firstSlide, $this.entrance);
					
				setTimeout(function(){
					//Increment the number of slideshows animating.
					global.numAnimating++;		
					
					if(global.numAnimating == global.numSlideShows){
						//If the number of slideshows animating equals the number of slideshows total,
						//then the animation for all slideshows has finished. Reset the counter back to 0.
						global.animating = false;
						global.numAnimating = 0;				
						
						jQuery(defaultSettings.nav).removeClass('slideNavUnclickable slideNavActiveUnclickable');
					}
				},$this.entrance.speed);									
				
				//If displaySlide is used for navigational purposes, a transition pause is unnecessary. 
				//However, a negative transition value implies an overlap effect, so that needs to be included during navigation animations.
			}, ($this.delay + $this.exit.speed + $this.entrance.speed + ((global.navSelected == false || (global.navSelected == true && $this.transition < 0)) ? $this.transition : 0)));
			   
		}
	};	

	//------------------------------Class slideshow prototype: animate------------------------------//
	//Description: Cycles through each slide, displaying one after the other
	//PARAMETERS:
	//newRelativeIndex: The index of the slide that will enter in relation to its position in the
    //                  jQuery object. (This index is dynamic due to how jQuery treats a jQuery
	//                  object that has been rearranged.)
	//newActiveIndex:   The index of the slide that will enter in relation to its absolute position
	//                  in the sequence of slides.
	//Postcondition:    The global.activeIndex variable is adjusted. Visually, a new slide appears if
	//                  the proper conditions are met. 
	//----------------------------------------------------------------------------------------------//	
	slideshow.prototype.animate = function(){	
		//Establish scope
		var $this = this;
				
			//For as many slides that exist, and for as many cycles specified
			for(var i = 1; i < ($this.slides.length * $this.cycles); i++){				
					setTimeout(function(){
						//If a navigational element hasn't been selected.
						if(global.navSelected == false){						
							//Only apply changes to the active and nav indexes for one slide, and let the 
							//other slides use the same indexes.
							if($this == slideshowArray.main){
								/*Example: 5 slides in slideshow array.
								Since arrays start at 0, max index of slideshow array = 4
								=> Can only increment when index < 4 (or we exceed the array bounds)
								=> Can only increment when index < (5 - 1)
								=> Can only increment when index < (number of slides - 1)
								
								If index is not less than (number of slides - 1), reset the index back to 0. 
								*/								
								(global.activeIndex < global.numSlides - 1) ? global.activeIndex++ : global.activeIndex = 0; 
								
								//Find the relative index of the slide in the jQuery object.
								global.relativeIndex = jQuery(global.slidesTemplate[global.activeIndex]).getIndexOf(slideshowArray["main"].slides);
							}								
							$this.displaySlide(global.relativeIndex, global.activeIndex);		
						}
					}, (($this.duration + $this.entrance.speed + $this.exit.speed + $this.transition + global.totalDelay) * i));				
			}
	};

	//-------------------------Class slideshow prototype: doTransition-------------------------//
	//Description: Exits the active slide
	//PARAMETERS:
	//     slide: The slide that will be animating.
	//transition: An object that holds the following properties:
	//		animation: A string that determines the animation option.
	//		    speed: How fast the animation executes
	//         easing: Easing option
	//-----------------------------------------------------------------------------------------//		
	slideshow.prototype.doTransition = function(slide, transition){		
		//Copy to local variables for convenience. 
	    var animation = transition.animation.toLowerCase();
	     var distance = jQuery(slide).width();
		    var speed = transition.speed
		
		switch(animation){
			//Entrance animations
			case "fromright":			
				jQuery(slide).animate({'left': '+=' + distance + 'px', 'opacity': 'show'}, 0)
							 .animate({'left':'-=' + distance + 'px'}, speed);
							 break;			
			
			case "fromleft":			
				jQuery(slide).animate({'left': '-=' + distance + 'px', 'opacity': 'show'}, 0)
							 .animate({'left':'+=' + distance + 'px'}, speed);
							 break;			
			
			case "frombottom":			
				jQuery(slide).animate({'top': '+=' + distance + 'px', 'opacity': 'show'}, 0)
							 .animate({'top':'-=' + distance + 'px'}, speed);
							 break;			
			
			case "fromtop":			
				jQuery(slide).animate({'top': '-=' + distance + 'px', 'opacity': 'show'}, 0)
							 .animate({'top':'+=' + distance + 'px'}, speed);
							 break;
			
			case "fadein":
				jQuery(slide).fadeIn(speed);
							 break;
		
			//Exit animations
			case "toleft":			
				jQuery(slide).animate({'left': '-=' + distance + 'px'}, speed)
						     .animate({'opacity':'hide', 'left':'+=' + distance + 'px'}, 0);
							 break;			
			
			case "toright":			
				jQuery(slide).animate({'left': '+=' + distance + 'px'}, speed)
							 .animate({'opacity':'hide', 'left':'-=' + distance + 'px'}, 0);
							 break;
						
			case "totop":			
				jQuery(slide).animate({'top': '-=' + distance + 'px'}, speed)
							 .animate({'opacity':'hide', 'top':'+=' + distance + 'px'}, 0);
							 break;			
			
			case "tobottom":			
				jQuery(slide).animate({'top': '+=' + distance + 'px'}, speed)
							 .animate({'opacity':'hide', 'top':'-=' + distance + 'px'}, 0);
							 break;			
			default:
				jQuery(slide).fadeOut(speed);		
		}
	};		

	//Object that will hold the slideshows to be iterated over. Psuedo array.
	//Initialize the main slideshow.
	var slideshowArray = {main: new slideshow(defaultSettings)};		
		
	//---------------------------------------------------------------------------------//
	//----------------------------  Add Slave Slideshows   ----------------------------//
	//---------------------------------------------------------------------------------//		
	
	this.addSlave = function(opts){
			slideshowArray["slave" + global.numSlideShows] = new slideshow(opts);
	};
	
	//---------------------------------------------------------------------------------//
	//----------------------------    Append Navigation    ----------------------------//
	//---------------------------------------------------------------------------------//		
	
	this.addNav = function(){
			jQuery(defaultSettings.container).append('<div id="slideshow_nav"><ul><li class="slideNavActive">1</li><li>2</li><li>3</li></ul></div>');
	};
	//---------------------------------------------------------------------------------//
	//-----------------------------Begin Slide Navigations-----------------------------//
	//---------------------------------------------------------------------------------//		
	
	//If slideshow navigation was specified.
	if(isset(defaultSettings.nav) || isset(defaultSettings.left)){			
		
		jQuery(defaultSettings.nav).click(function(){
			//If the slideshow is not animating and current displaySlide is finished
			if(global.animating == false && global.numAnimating == 0){
				//Indicates that a navigational element has beens selected.
				//The slideshow will stop its cycle.
				global.navSelected = true;
				
				//Find the relative index of the slide in the jQuery object.
				global.relativeIndex = jQuery(global.slidesTemplate[jQuery(this).index()]).getIndexOf(slideshowArray["main"].slides);

				//For each slideshow in the slideshow array, display the slide
				for (var i in slideshowArray){
					slideshowArray[i].displaySlide(global.relativeIndex, jQuery(this).index());					
				}
			}
		});
	}
	
	//---------------------------------------------------------------------------------//
	//----------------------------Left and Right Slide Shift---------------------------//
	//---------------------------------------------------------------------------------//		
	
	if(isset(defaultSettings.left) && isset(defaultSettings.right)){
		//If left or right scroller is clicked
		defaultSettings.right.add(defaultSettings.left).click(function(){
			//If the slideshow is not animating and current displaySlide is finished
			if(global.animating == false && global.numAnimating == 0){				
				//Indicates that a navigational element has beens selected.
				//The slideshow will stop its cycle.
				global.navSelected = true;			
			
				//If left scroller clicked
				if(jQuery(this).equalTo(defaultSettings.left)){					
						//If moving left, decrement the activeIndex unless the activeIndex is zero. At that point, reset
						//The active index to the index of the last slide (global.numSlides-1)
						global.activeIndex > 0? global.activeIndex--: global.activeIndex = global.numSlides-1;
	
				}
				else{			
						//If moving right, increment the activeIndex unless the activeIndex is the last index. At that point, reset
						//The active index to the index of the first slide (0).
						global.activeIndex < global.numSlides-1? global.activeIndex++: global.activeIndex = 0;
				}
				
				
				global.relativeIndex = jQuery(global.slidesTemplate[global.activeIndex]).getIndexOf(slideshowArray["main"].slides);
			

				//For each slideshow in the slideshow array, display the slide
				for (var i in slideshowArray){
					slideshowArray[i].displaySlide(global.relativeIndex, global.activeIndex);					
				}
			}
		});
	}
	
	//---------------------------------------------------------------------------------//
	//----------------------------    Trigger Animation     ---------------------------//
	//---------------------------------------------------------------------------------//		
	
	this.animate = function(){
		//For each slideshow in the slideshowArray, run the slideshow Animation
		//And count how many slideshows there are
		for (var i in slideshowArray){
			jQuery(slideshowArray[i].slides).fakeFloat();
			slideshowArray[i].animate();
		}			
	}
};

