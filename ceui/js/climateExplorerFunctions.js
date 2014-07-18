
$(document).ready(function () {
//sets css for JQuery UI Accordian
	var myTheme = "ui-darkness"

// arrays that feed slider tooltip
	var monthArr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
	var yearArr = [];
	
// temp array to demonstrated swapping of images based on month
	var tempImgArr = ["media/testMaps/01.png","media/testMaps/02.png","media/testMaps/03.png","media/testMaps/04.png","media/testMaps/05.png","media/testMaps/06.png","media/testMaps/07.png","media/testMaps/08.png","media/testMaps/09.png","media/testMaps/10.png","media/testMaps/11.png","media/testMaps/12.png" ]

// var contains which radio button that is selected for image download
	var whichFile;

// hides Description section containers
	$("#aboutDatePanelHolder").hide();
	$("#downloadPop").hide();
	$("#maintextHolder").hide();
	
// initialize JQWidget month slider widget
       $('#monthSlider').jqxSlider({ 
		theme:myTheme,
		min: 0, 
		max: 11, 
		ticksFrequency: 1, 
		value: 0, 
		step: 1,
		showButtons: false,
		ticksPosition: 'top',
		width: 380,
		showRange: false,
		mode: 'fixed',
		tooltip: false
	});

// creates tootip for month slider	
	function createMonthTooltip() {
        	var mTooltip = $('<div />');
        	$(document.body).append(mTooltip);
        	mTooltip.css('visibility', 'hidden');
        	mTooltip.fadeTo(0, 0.6);
        	mTooltip.addClass('jqx-rc-all');
        	mTooltip.addClass('mTooltip');
        	return mTooltip;
    	}  
// moves and updates month tootip value
	function refreshMonthTooltip(value) {
        	var mThumb = $($('#monthSlider').find('.jqx-slider-slider')[1]),
            	mThumbX = mThumb.offset().left,
            	mThumbY = mThumb.offset().top;
        	mTooltip.css('left', mThumbX - (mTooltip.outerWidth(true) - mThumb.outerWidth(true)) / 2);
        	mTooltip.css('top', mThumbY - mTooltip.outerHeight(true) - 3);
		mTooltip.text(monthArr[value]);
		$('#mapHold').attr("src", tempImgArr[value]);
    	}   


	var mThumb = $($('#monthSlider').find('.jqx-slider-slider')[1]),
  	mTooltip = createMonthTooltip(),
  	tooltipActive = false;

// binds mouse events to month slider thumb
  	mThumb.bind('mousedown', function (event) {
    		mTooltip.css('visibility', 'visible');
    		refreshMonthTooltip($('#monthSlider').jqxSlider('value'));
    		tooltipActive = true;
  	});

  	$(document).bind('mousemove', function (event) {
    		if (tooltipActive) {
     			refreshMonthTooltip($('#monthSlider').jqxSlider('value'));
    		}
  	});
  
  	$(document).bind('mouseup', function () {
    		mTooltip.css('visibility', 'hidden');
    		tooltipActive = false;
  	});

	
// calculates number of years in data set, and builds an array of years that feeds year slider tootip
	function calcNumYears(years){
		var currentYear = (new Date).getFullYear();
		var startDate = currentYear - (years);

		for(i=0; i<years+1; i++){
			yearArr.push(startDate+i);
		}

		
// initialize JQWidget month slider widget
		$('#yearSlider').jqxSlider({ 
			theme:myTheme,
			min: 0, 
			max: years, 
			ticksFrequency: 1, 
			value: 0, 
			step: 1,
			showButtons: false,
			ticksPosition: 'bottom',
			width: 380,
			showRange: false,
			mode: 'fixed',
			tooltip: false
		});
		
// changes start date on years slider
		$('#botLeftValSlidLab').html(startDate);

	}

//calls the the function that builds that year array (above)
	calcNumYears(14);

// creates tootip for month slider
 	function createYearTooltip() {
        	var yTooltip = $('<div />');
        	$(document.body).append(yTooltip);
        	yTooltip.css('visibility', 'hidden');
        	yTooltip.fadeTo(0, 0.6);
        	yTooltip.addClass('jqx-rc-all');
        	yTooltip.addClass('yTooltip');
        	return yTooltip;
    	}  
		
// moves and updates year tootip value
	function refreshYearTooltip(value) {
        	var yThumb = $($('#yearSlider').find('.jqx-slider-slider')[1]),
            	yThumbX = yThumb.offset().left,
            	yThumbY = yThumb.offset().top;
        	yTooltip.css('left', yThumbX - (yTooltip.outerWidth(true) - yThumb.outerWidth(true)) / 2);
        	yTooltip.css('top', yThumbY - yTooltip.outerHeight(true) - 3);
		yTooltip.text(yearArr[value]);
    	}   


	var yThumb = $($('#yearSlider').find('.jqx-slider-slider')[1]),
  	yTooltip = createYearTooltip(),
  	tooltipActive = false;
	
// binds mouse events to year slider thumb
  	yThumb.bind('mousedown', function (event) {
    		yTooltip.css('visibility', 'visible');
    		refreshYearTooltip($('#yearSlider').jqxSlider('value'));
    		tooltipActive = true;
  	});

  	$(document).bind('mousemove', function (event) {
    		if (tooltipActive) {
     			refreshYearTooltip($('#yearSlider').jqxSlider('value'));
    		}
  	});
  
  	$(document).bind('mouseup', function () {
    		yTooltip.css('visibility', 'hidden');
    		tooltipActive = false;
  	});

// initialize JQWidget button widgets
 	$("#downloadButt").jqxToggleButton({ theme:myTheme, width: '86', toggled: false });
	$("#cancelButt").jqxButton({ theme:myTheme, width: '68'});
	$("#okButt").jqxButton({ theme:myTheme, width: '68'});
	$("#descMapButtGrp").jqxButtonGroup({ theme: myTheme, mode: 'radio' });
	$("#descMapButtGrp").jqxButtonGroup('setSelection', 0);
	
	
// checks whether Maps or Description buttons have been selected, and hides or shows the either
// the MENU widget and About this Snapshot Panel OR the Description text and About this date slider widget.
	$("#descMapButtGrp").click(function(){
		var whichSelect = $("#descMapButtGrp").jqxButtonGroup('getSelection');
		if(whichSelect == 0){
			$("#maintextHolder").fadeOut(100);
			$("#mapMenHold").fadeIn(100);
			$("#aboutSnapPanelHolder").show();
			$("#aboutDatePanelHolder").hide();
			$("#aboutTitle").html("About This Snapshot:");
		}else if(whichSelect == 1){
			$("#maintextHolder").fadeIn(100);
			$("#mapMenHold").fadeOut(100);
			$("#aboutSnapPanelHolder").hide();
			$("#aboutDatePanelHolder").show();
				$("#aboutTitle").hide();
				$("#aboutPar").hide();
				$("#moreAboutLab").hide();


			$("#aboutTitle").html("About This Date:");
		}
	});



// shows the Download file selection pop-up
	$("#downloadButt").click(function() {
		var toggled = $("#downloadButt").jqxToggleButton('toggled');
              if (toggled) {
			$("#downloadPop").fadeIn(200);
			whichFile = "620";
		}else{
			$("#downloadPop").fadeOut(200);
		}
	});
	
// initialize JQWidget radio button widgets in Download File selection pop-up
	$("#DL_RadioButton_620").jqxRadioButton({ theme:myTheme, width: 150, height: 25, checked: true});
    $("#DL_RadioButton_1000").jqxRadioButton({ theme:myTheme, width: 150, height: 25});
    $("#DL_RadioButton_1920").jqxRadioButton({ theme:myTheme, width: 150, height: 25});
    $("#DL_RadioButton_1920SD").jqxRadioButton({ theme:myTheme, width: 150, height: 25});
	$("#DL_RadioButton_Full").jqxRadioButton({ theme:myTheme, width: 150, height: 25});
	
// event handlers for the radio buttons in the Download File selection pop-up that sets the whichFile flag
// to be used in the download file logic
	$("#DL_RadioButton_620").on('checked', function (event) {
                whichFile = "620";
            });       

	$("#DL_RadioButton_1000").on('checked', function (event) {
                whichFile = "1000";
            });

       $("#DL_RadioButton_1920").on('checked', function (event) {
               whichFile = "1920";
            });

       $("#DL_RadioButton_1920SD").on('checked', function (event) {
		whichFile = "1920SD";
           });

	$("#DL_RadioButton_Full").on('checked', function (event) {
                whichFile = "Full";
            });

// event handlers for Cancel and OK buttons in the Download pop-up
	$("#cancelButt").click(function() {
		$("#downloadPop").fadeOut(200);
		$('#downloadButt').jqxToggleButton('toggle'); 
	});

	$("#okButt").click(function() {
		console.log("You have selcted:  " +whichFile);
		
		$("#downloadPop").fadeOut(200);
		$('#downloadButt').jqxToggleButton('toggle'); 
	});

// event handler for the About this date slider found on the Description area
	$( "#moreAboutLab" ).click(function() {
		if($( "#moreAboutLab" ).hasClass("isDown")){
			$( "#bottomer" ).animate({top: "+=128"}, 500)
			$("#moreAboutLab").html("read more&gt;&gt;");
			$( "#moreAboutLab" ).removeClass("isDown");
		}else{
			$( "#bottomer" ).animate({top: "-=128"}, 500, function() { 
			$("#moreAboutLab").html("read less&gt;&gt;");
		});
			$( "#moreAboutLab" ).addClass("isDown");
		}
			return false;
	});

		var imageCount;
		var imagePath = [];
		var tempArr = [];

// initializes JQuery UI Accordion widget
		$(function() {
			$( "#accordion" ).accordion()({
				heightStyle: "content"				
			});
		});

// event handler for Accordion widget.  Test for which header is selected and sets content height to allow
// for proper display of sub-menus; swaps out starter image for initial data set for that section AND 
// calls functions that build sub-menus.
		$( "#accordion" ).on( "accordionactivate", function( event, newPanel ) {
			var active = $( "#accordion" ).accordion( "option", "active" );

			if(active == 0){
				$('#DS_MenuSelector0').css('height', 96);

				$('#mapHold').fadeOut( 160, function() {
					$('#mapHold').attr("src", "");
					doTempSearch();
				})

				$( "#accordion" ).accordion( "option", "heightStyle", "content" );
			}else if(active == 1){
				$('#DS_MenuSelector1').css('height', 54);

				$('#mapHold').fadeOut( 160, function() {
					$('#mapHold').attr("src", "");
					doPrecipSearch();
				})

				$( "#accordion" ).accordion( "option", "heightStyle", "content" );
			}else if(active == 2){
				$('#DS_MenuSelector2').css('height', 81);
				
				$('#mapHold').fadeOut( 160, function() {
					$('#mapHold').attr("src", "");
					doOutlookSearch();
				})
				
				$( "#accordion" ).accordion( "option", "heightStyle", "content" );
			}else if(active == 3){
				$('#DS_MenuSelector3').css('height', 54);

				$('#mapHold').fadeOut( 160, function() {
					$('#mapHold').attr("src", "");
					doDroughtSearch();
				})

				$( "#accordion" ).accordion( "option", "heightStyle", "content" );
			}else if(active == 4){
				$('#DS_MenuSelector4').css('height', 28);
				
				$('#mapHold').fadeOut( 160, function() {
					$('#mapHold').attr("src", "");
					doSevWeatSearch();
				})

				$( "#accordion" ).accordion( "option", "heightStyle", "content" );
			}
		});


// centers map in map window based on the mapType variable.  This value is received from the CMS call.
		function mapTopMarginLogic(){
			if(mapType == "CONUS"){
				$('#mapHold').css("margin-top", 5);
			}else if(mapType == "Global"){
				mapTopMargin = ($('#middleLeftHolder').height() -365)/2;
				$('#mapHold').css("margin-top", mapTopMargin);
			}
		}

// triggers the initial AJAX call to build and parse sub-menu data and interactivity for the
// Temperature Heading 
		doTempSearch();


// Next five (5) functions make AJAX requests to local XML files that contain content data that
// populate Text and Image UI elements for each section.  Functions also build sub-menus and distribute
// content info to each button in sub-menu

// Builds sub-menu for Temperature

		function doTempSearch(){

			$('#monthSlider').jqxSlider('enable'); 	//temporary
			$('#yearSlider').jqxSlider('enable');	//temporary

			var arrThree = []
			var arrFour = [];

			$.ajax({
            			url: 'xml/DS_Temp.xml',
            			dataType: 'xml',
            			success: function(data){
                		$(data).find('entry').each(function() {

					arrThree.push($(this).find('title').text());		//[0]
					arrThree.push($(this).find('questOne').text());		//[1]
					arrThree.push($(this).find('questTwo').text());		//[2]
					arrThree.push($(this).find('aboutSnap').text());	//[3]
					arrThree.push($(this).find('imgURL').text());		//[4]
					arrThree.push($(this).find('mapType').text());		//[5]

					arrFour.push(arrThree);
					arrThree = [];
				})
				
				mapType = arrFour[0][5];

				mapTopMarginLogic();
												
				$("#descTitle").html(arrFour[0][0]);
				$("#topText").html(arrFour[0][1]);
				$("#bottomText").html(arrFour[0][2].substr(0,250)+'...');
				$("#aboutSnapPar").html(arrFour[0][3]);
							
				$('#mapHold').attr("src", arrFour[0][4]);
				$('#mapHold').fadeIn(160);
				
				$('.DS_MenuContHold').remove();
				$('#DS_MenuSelector0').css('height', 135);

				for(i=0; i<arrFour.length; i++){
				
					$('<div/>', {"class": 'DS_MenuContHold', id: 'foo'+i, title:arrFour[i][0], Q1:arrFour[i][1], Q2:arrFour[i][2], abSnap:arrFour[i][3], image: arrFour[i][4], mapType: arrFour[i][5]}).appendTo('#DS_MenuSelector0');
					$('<div/>', {id: 'RBox'+i, rel: 'internal'}).appendTo('#foo'+i);				
					$('<span/>', {id: 'titleHolder'+i, rel: 'internal'}).appendTo('#RBox'+i);
					$('<div/>', {id: 'extentIconHolder'+i, rel: 'internal'}).appendTo('#RBox'+i);
					$('<img/>', {id: 'extentIcon'+i, rel: 'internal'}).appendTo('#extentIconHolder'+i);
					
					$('#RBox'+i).addClass('RBoxStyle');
					$('#titleHolder'+i).addClass('DS_MenuTitleHoldStyle');
					$('#extentIconHolder'+i).addClass('DS_extentIconHoldStyle');
					$('#extentIcon'+i).addClass('DS_extentIcon');
					
					
					
					$('#titleHolder'+i).text(arrFour[i][0]);
				
					$('foo'+i).data(arrFour[i][3]);
					
					if(arrFour[i][5] == "CONUS"){
						$('#extentIcon'+i).attr('src', 'media/uiGraphics/conusIcon.png');
					}else{
						$('#extentIcon'+i).attr('src', 'media/uiGraphics/globalIcon.png');
					}
   				}
			
				imagePath = arrFour[0][1];
				arrTwo = [];
			
				$('#foo0').addClass('selected').css('background-color', '#aaa');
			
				$('.DS_MenuContHold').hover(function(){
					if(!$(this).hasClass("selected")){
						$(this).css('background-color', '#aaa')
					}
				},
 				function(){
					if(!$(this).hasClass("selected")){
					$(this).css('background-color', '#888')
				}
 				
				}).click(function(){

					if($(this).attr("id") == "foo0"){

						$('#monthSlider').jqxSlider('enable');
						$('#yearSlider').jqxSlider('enable');
					}else{

						$('#monthSlider').jqxSlider('disable');
						$('#yearSlider').jqxSlider('disable');
					}

 					$('.DS_MenuContHold').removeClass('selected').css('background-color', '#888');
					$(this).css('background-color', '#aaa');
					$(this).addClass('selected').css('background-color', '#aaa');
					
					mapType = $(this).attr("mapType");
 					imagePath = $(this).attr("image");

					$('#mapHold').fadeOut( 160, function() {
						$('#mapHold').attr("src", "");

						mapTopMarginLogic();

						$('#mapHold').attr("src", imagePath);
						$('#mapHold').fadeIn(160);
					});
				
					var titTxt = $(this).attr("title");
					var tTxt = $(this).attr("Q1");
					var bTxt = $(this).attr("Q2");
					var abTxt = $(this).attr("abSnap");

					$("#descTitle").html(titTxt);
					$("#topText").html(tTxt);
					$("#bottomText").html(bTxt.substr(0,220)+'...');
					$("#aboutSnapPar").html(abTxt);
 				});
			},
			error: function(){
				alert('Failed to get data');
			}
		})
	}

// Builds sub-menu for Precipitation
		function doPrecipSearch(){

			$('#monthSlider').jqxSlider('disable');	//temporary
			$('#yearSlider').jqxSlider('disable');	//temporary
			
			var arrThree = []
			var arrFour = [];

			$.ajax({
            			url: 'xml/DS_Precip.xml',
            			dataType: 'xml',
            			success: function(data){
                		$(data).find('entry').each(function() {

					arrThree.push($(this).find('title').text());		//[0]
					arrThree.push($(this).find('questOne').text());		//[1]
					arrThree.push($(this).find('questTwo').text());		//[2]
					arrThree.push($(this).find('aboutSnap').text());	//[3]
					arrThree.push($(this).find('imgURL').text());		//[4]
					arrThree.push($(this).find('mapType').text());		//[5]

					arrFour.push(arrThree);
					arrThree = [];
				})
				
				mapType = arrFour[0][5];
												
				$("#descTitle").html(arrFour[0][0]);
				$("#topText").html(arrFour[0][1]);
				$("#bottomText").html(arrFour[0][2].substr(0,250)+'...');
				$("#aboutSnapPar").html(arrFour[0][3]);

				mapTopMarginLogic();
						
				$('#mapHold').attr("src", arrFour[0][4]);
				$('#mapHold').fadeIn(160);

				$('.DS_MenuContHold').remove();
				$('#DS_MenuSelector0').css('height', 135);

				for(i=0; i<arrFour.length; i++){
				
					$('<div/>', {"class": 'DS_MenuContHold', id: 'foo'+i, title:arrFour[i][0], Q1:arrFour[i][1], Q2:arrFour[i][2], abSnap:arrFour[i][3], image: arrFour[i][4], mapType: arrFour[i][5]}).appendTo('#DS_MenuSelector1');
					$('<div/>', {id: 'RBox'+i, rel: 'internal'}).appendTo('#foo'+i);				
					$('<span/>', {id: 'titleHolder'+i, rel: 'internal'}).appendTo('#RBox'+i);
					$('<div/>', {id: 'extentIconHolder'+i, rel: 'internal'}).appendTo('#RBox'+i);
					$('<img/>', {id: 'extentIcon'+i, rel: 'internal'}).appendTo('#extentIconHolder'+i);
					
					$('#RBox'+i).addClass('RBoxStyle');
					$('#titleHolder'+i).addClass('DS_MenuTitleHoldStyle');
					$('#extentIconHolder'+i).addClass('DS_extentIconHoldStyle');
					$('#extentIcon'+i).addClass('DS_extentIcon');
					
					$('#titleHolder'+i).text(arrFour[i][0]);
				
					$('foo'+i).data(arrFour[i][3]);
					
					if(arrFour[i][5] == "CONUS"){
						$('#extentIcon'+i).attr('src', 'media/uiGraphics/conusIcon.png');
					}else{
						$('#extentIcon'+i).attr('src', 'media/uiGraphics/globalIcon.png');
					}
   				}
			
				imagePath = arrFour[0][1];
				arrTwo = [];
			
				$('#foo0').addClass('selected').css('background-color', '#aaa');
			
				$('.DS_MenuContHold').hover(function(){
					if(!$(this).hasClass("selected")){
						$(this).css('background-color', '#aaa')
					}
				},
 				function(){
					if(!$(this).hasClass("selected")){
					$(this).css('background-color', '#888')
				}
 				
				}).click(function(){
 					$('.DS_MenuContHold').removeClass('selected').css('background-color', '#888');
					$(this).css('background-color', '#aaa');
					$(this).addClass('selected').css('background-color', '#aaa');
					
					mapType = $(this).attr("mapType");
 					imagePath = $(this).attr("image");

					$('#mapHold').fadeOut( 160, function() {
						$('#mapHold').attr("src", "");

						mapTopMarginLogic();
						
						$('#mapHold').attr("src", imagePath);
						$('#mapHold').fadeIn(160);
					});
				
					var titTxt = $(this).attr("title");
					var tTxt = $(this).attr("Q1");
					var bTxt = $(this).attr("Q2");
					var abTxt = $(this).attr("abSnap");

					$("#descTitle").html(titTxt);
					$("#topText").html(tTxt);
					$("#bottomText").html(bTxt.substr(0,220)+'...');
					$("#aboutSnapPar").html(abTxt);
 				});
			},
			error: function(){
				alert('Failed to get data');
			}
		})
	}

// Builds sub-menu for Outlook
		function doOutlookSearch(){

			$('#monthSlider').jqxSlider('disable');	//temporary
			$('#yearSlider').jqxSlider('disable');	//temporary

			var arrThree = []
			var arrFour = [];

			$.ajax({
            			url: 'xml/DS_Outlooks.xml',
            			dataType: 'xml',
            			success: function(data){
                		$(data).find('entry').each(function() {

					arrThree.push($(this).find('title').text());		//[0]
					arrThree.push($(this).find('questOne').text());		//[1]
					arrThree.push($(this).find('questTwo').text());		//[2]
					arrThree.push($(this).find('aboutSnap').text());	//[3]
					arrThree.push($(this).find('imgURL').text());		//[4]
					arrThree.push($(this).find('mapType').text());		//[5]

					arrFour.push(arrThree);
					arrThree = [];
				})
				
				mapType = arrFour[0][5];
																
				$("#descTitle").html(arrFour[0][0]);
				$("#topText").html(arrFour[0][1]);
				$("#bottomText").html(arrFour[0][2].substr(0,250)+'...');
				$("#aboutSnapPar").html(arrFour[0][3]);
				
				mapTopMarginLogic();
						
				$('#mapHold').attr("src", arrFour[0][4]);
				$('#mapHold').fadeIn(160);
				
				$('.DS_MenuContHold').remove();
				$('#DS_MenuSelector0').css('height', 135);

				for(i=0; i<arrFour.length; i++){
				
					$('<div/>', {"class": 'DS_MenuContHold', id: 'foo'+i, title:arrFour[i][0], Q1:arrFour[i][1], Q2:arrFour[i][2], abSnap:arrFour[i][3], image: arrFour[i][4], mapType: arrFour[i][5]}).appendTo('#DS_MenuSelector2');
					$('<div/>', {id: 'RBox'+i, rel: 'internal'}).appendTo('#foo'+i);				
					$('<span/>', {id: 'titleHolder'+i, rel: 'internal'}).appendTo('#RBox'+i);
					$('<div/>', {id: 'extentIconHolder'+i, rel: 'internal'}).appendTo('#RBox'+i);
					$('<img/>', {id: 'extentIcon'+i, rel: 'internal'}).appendTo('#extentIconHolder'+i);
					
					$('#RBox'+i).addClass('RBoxStyle');
					$('#titleHolder'+i).addClass('DS_MenuTitleHoldStyle');
					$('#extentIconHolder'+i).addClass('DS_extentIconHoldStyle');
					$('#extentIcon'+i).addClass('DS_extentIcon');
					
					$('#titleHolder'+i).text(arrFour[i][0]);
				
					$('foo'+i).data(arrFour[i][3]);
					
					if(arrFour[i][5] == "CONUS"){
						$('#extentIcon'+i).attr('src', 'media/uiGraphics/conusIcon.png');
					}else{
						$('#extentIcon'+i).attr('src', 'media/uiGraphics/globalIcon.png');
					}
   				}
			
				imagePath = arrFour[0][1];
				arrTwo = [];
			
				$('#foo0').addClass('selected').css('background-color', '#aaa');
			
				$('.DS_MenuContHold').hover(function(){
					if(!$(this).hasClass("selected")){
						$(this).css('background-color', '#aaa')
					}
				},
 				function(){
					if(!$(this).hasClass("selected")){
					$(this).css('background-color', '#888')
				}
 				
				}).click(function(){
 					$('.DS_MenuContHold').removeClass('selected').css('background-color', '#888');
					$(this).css('background-color', '#aaa');
					$(this).addClass('selected').css('background-color', '#aaa');
					
					mapType = $(this).attr("mapType");
 					imagePath = $(this).attr("image");

					$('#mapHold').fadeOut( 160, function() {
						$('#mapHold').attr("src", "");

						mapTopMarginLogic();
						
						$('#mapHold').attr("src", imagePath);
						$('#mapHold').fadeIn(160);
					});
				
					var titTxt = $(this).attr("title");
					var tTxt = $(this).attr("Q1");
					var bTxt = $(this).attr("Q2");
					var abTxt = $(this).attr("abSnap");

					$("#descTitle").html(titTxt);
					$("#topText").html(tTxt);
					$("#bottomText").html(bTxt.substr(0,220)+'...');
					$("#aboutSnapPar").html(abTxt);
 				});
			},
			error: function(){
				alert('Failed to get data');
			}
		})
	}

// Builds sub-menu for Drought
		function doDroughtSearch(){

			$('#monthSlider').jqxSlider('disable');	//temporary	
			$('#yearSlider').jqxSlider('disable');	//temporary

			var arrThree = []
			var arrFour = [];

			$.ajax({
            			url: 'xml/DS_Drought.xml',
            			dataType: 'xml',
            			success: function(data){
                		$(data).find('entry').each(function() {

					arrThree.push($(this).find('title').text());		//[0]
					arrThree.push($(this).find('questOne').text());		//[1]
					arrThree.push($(this).find('questTwo').text());		//[2]
					arrThree.push($(this).find('aboutSnap').text());	//[3]
					arrThree.push($(this).find('imgURL').text());		//[4]
					arrThree.push($(this).find('mapType').text());		//[5]

					arrFour.push(arrThree);
					arrThree = [];
				})
				
				mapType = arrFour[0][5];
																
				$("#descTitle").html(arrFour[0][0]);
				$("#topText").html(arrFour[0][1]);
				$("#bottomText").html(arrFour[0][2].substr(0,250)+'...');
				$("#aboutSnapPar").html(arrFour[0][3]);

				mapTopMarginLogic();
						
				$('#mapHold').attr("src", arrFour[0][4]);
				$('#mapHold').fadeIn(160);

				$('.DS_MenuContHold').remove();
				$('#DS_MenuSelector0').css('height', 135);

				for(i=0; i<arrFour.length; i++){
				
					$('<div/>', {"class": 'DS_MenuContHold', id: 'foo'+i, title:arrFour[i][0], Q1:arrFour[i][1], Q2:arrFour[i][2], abSnap:arrFour[i][3], image: arrFour[i][4], mapType: arrFour[i][5]}).appendTo('#DS_MenuSelector3');
					$('<div/>', {id: 'RBox'+i, rel: 'internal'}).appendTo('#foo'+i);				
					$('<span/>', {id: 'titleHolder'+i, rel: 'internal'}).appendTo('#RBox'+i);
					$('<div/>', {id: 'extentIconHolder'+i, rel: 'internal'}).appendTo('#RBox'+i);
					$('<img/>', {id: 'extentIcon'+i, rel: 'internal'}).appendTo('#extentIconHolder'+i);
					
					$('#RBox'+i).addClass('RBoxStyle');
					$('#titleHolder'+i).addClass('DS_MenuTitleHoldStyle');
					$('#extentIconHolder'+i).addClass('DS_extentIconHoldStyle');
					$('#extentIcon'+i).addClass('DS_extentIcon');
					
					$('#titleHolder'+i).text(arrFour[i][0]);
				
					$('foo'+i).data(arrFour[i][3]);
					
					if(arrFour[i][5] == "CONUS"){
						$('#extentIcon'+i).attr('src', 'media/uiGraphics/conusIcon.png');
					}else{
						$('#extentIcon'+i).attr('src', 'media/uiGraphics/globalIcon.png');
					}
   				}
			
				imagePath = arrFour[0][1];
				arrTwo = [];
			
				$('#foo0').addClass('selected').css('background-color', '#aaa');
			
				$('.DS_MenuContHold').hover(function(){
					if(!$(this).hasClass("selected")){
						$(this).css('background-color', '#aaa')
					}
				},
 				function(){
					if(!$(this).hasClass("selected")){
					$(this).css('background-color', '#888')
				}
 				
				}).click(function(){
 					$('.DS_MenuContHold').removeClass('selected').css('background-color', '#888');
					$(this).css('background-color', '#aaa');
					$(this).addClass('selected').css('background-color', '#aaa');
					
					mapType = $(this).attr("mapType");
 					imagePath = $(this).attr("image");

					$('#mapHold').fadeOut( 160, function() {
						$('#mapHold').attr("src", "");

						mapTopMarginLogic();
						
						$('#mapHold').attr("src", imagePath);
						$('#mapHold').fadeIn(160);
					});
				
					var titTxt = $(this).attr("title");
					var tTxt = $(this).attr("Q1");
					var bTxt = $(this).attr("Q2");
					var abTxt = $(this).attr("abSnap");

					$("#descTitle").html(titTxt);
					$("#topText").html(tTxt);
					$("#bottomText").html(bTxt.substr(0,220)+'...');
					$("#aboutSnapPar").html(abTxt);
 				});
			},
			error: function(){
				alert('Failed to get data');
			}
		})
	}
	
// Builds sub-menu for Severe Weather
		function doSevWeatSearch(){

			$('#monthSlider').jqxSlider('disable');	//temporary
			$('#yearSlider').jqxSlider('disable');	//temporary

			var arrThree = []
			var arrFour = [];

			$.ajax({
            			url: 'xml/DS_SevereWeather.xml',
            			dataType: 'xml',
            			success: function(data){
                		$(data).find('entry').each(function() {

					arrThree.push($(this).find('title').text());		//[0]
					arrThree.push($(this).find('questOne').text());		//[1]
					arrThree.push($(this).find('questTwo').text());		//[2]
					arrThree.push($(this).find('aboutSnap').text());	//[3]
					arrThree.push($(this).find('imgURL').text());		//[4]
					arrThree.push($(this).find('mapType').text());		//[5]

					arrFour.push(arrThree);
					arrThree = [];
				})
				
				mapType = arrFour[0][5];
																
				$("#descTitle").html(arrFour[0][0]);
				$("#topText").html(arrFour[0][1]);
				$("#bottomText").html(arrFour[0][2].substr(0,250)+'...');
				$("#aboutSnapPar").html(arrFour[0][3]);
				
				mapTopMarginLogic();
						
				$('#mapHold').attr("src", arrFour[0][4]);
				$('#mapHold').fadeIn(160);

				$('.DS_MenuContHold').remove();
				$('#DS_MenuSelector0').css('height', 135);

				for(i=0; i<arrFour.length; i++){
				
					$('<div/>', {"class": 'DS_MenuContHold', id: 'foo'+i, title:arrFour[i][0], Q1:arrFour[i][1], Q2:arrFour[i][2], abSnap:arrFour[i][3], image: arrFour[i][4], mapType: arrFour[i][5]}).appendTo('#DS_MenuSelector4');
					$('<div/>', {id: 'RBox'+i, rel: 'internal'}).appendTo('#foo'+i);				
					$('<span/>', {id: 'titleHolder'+i, rel: 'internal'}).appendTo('#RBox'+i);
					$('<div/>', {id: 'extentIconHolder'+i, rel: 'internal'}).appendTo('#RBox'+i);
					$('<img/>', {id: 'extentIcon'+i, rel: 'internal'}).appendTo('#extentIconHolder'+i);
					
					$('#RBox'+i).addClass('RBoxStyle');
					$('#titleHolder'+i).addClass('DS_MenuTitleHoldStyle');
					$('#extentIconHolder'+i).addClass('DS_extentIconHoldStyle');
					$('#extentIcon'+i).addClass('DS_extentIcon');
					
					$('#titleHolder'+i).text(arrFour[i][0]);
				
					$('foo'+i).data(arrFour[i][3]);
					
					if(arrFour[i][5] == "CONUS"){
						$('#extentIcon'+i).attr('src', 'media/uiGraphics/conusIcon.png');
					}else{
						$('#extentIcon'+i).attr('src', 'media/uiGraphics/globalIcon.png');
					}
   				}
			
				imagePath = arrFour[0][1];
				arrTwo = [];
			
				$('#foo0').addClass('selected').css('background-color', '#aaa');
			
				$('.DS_MenuContHold').hover(function(){
					if(!$(this).hasClass("selected")){
						$(this).css('background-color', '#aaa')
					}
				},
 				function(){
					if(!$(this).hasClass("selected")){
					$(this).css('background-color', '#888')
				}
 				
				}).click(function(){
 					$('.DS_MenuContHold').removeClass('selected').css('background-color', '#888');
					$(this).css('background-color', '#aaa');
					$(this).addClass('selected').css('background-color', '#aaa');
					
					mapType = $(this).attr("mapType");
 					imagePath = $(this).attr("image");

					$('#mapHold').fadeOut( 160, function() {
						$('#mapHold').attr("src", "");

						mapTopMarginLogic();
						
						$('#mapHold').attr("src", imagePath);
						$('#mapHold').fadeIn(160);
					});
				
					var titTxt = $(this).attr("title");
					var tTxt = $(this).attr("Q1");
					var bTxt = $(this).attr("Q2");
					var abTxt = $(this).attr("abSnap");

					$("#descTitle").html(titTxt);
					$("#topText").html(tTxt);
					$("#bottomText").html(bTxt.substr(0,220)+'...');
					$("#aboutSnapPar").html(abTxt);
 				});
			},
			error: function(){
				alert('Failed to get data');
			}
		})
	}
});

