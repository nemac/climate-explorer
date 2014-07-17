var ceui = {};

ceui._myTheme = "ui-darkness";

ceui._enabled = false;

ceui.LAYERS = "layersTab";
ceui.MULTIGRAPH = "multigraphTab";

ceui.getMapElement = function() {
    return $("#mapHolder");
}

// ceui._variables is an array that keeps track of the list of station variable types that can be displayed in Muligraphs
// Each item in the array is an object of the form
//     { id : VARIABLE_ID, name : VARIABLE_NAME, selected : BOOLEAN }
//   'id' is a string which is the ID of the variable
//   'name' is a string which is displayed as a button label in the UI
//   'selected' is a boolean which indicates whether this variable is currently selected
// This array is populated by the ceui.setVariables() function below.
ceui._variables = [];

// return the variable object, from the ceui._variables array above, corresponding to the variable with the given id
ceui._variableById = function(id) {
    var i;
    for (i=0; i<ceui._variables.length; ++i) {
        if (ceui._variables[i].id === id) {
            return ceui._variables[i];
        }
    }
};

// Set the list of variable types.
//   'variables' should be an array of objects of the form
//       { id : VARIABLE_ID, name : VARIABLE_NAME, selected : BOOLEAN }
//   as described in the comment for ceui._variables above.
ceui.setVariables = function(variables) {
    $("#multiGrphButtHold").empty();
    ceui._variables = [];
    variables.forEach(function(variable) {
        var v = { id : variable.id, name : variable.name, selected : !!variable.selected };
        ceui._variables.push(v);
        var $graphVariableButon = $(ceui.templates.graphVariableButton).appendTo($("#multiGrphButtHold"));
        $graphVariableButon.attr("value", v.name);
        $graphVariableButon.jqxToggleButton({ theme: ceui._myTheme, width: '125', toggled: !!v.selected});
        $graphVariableButon.on('click', function () {
            var isOn = $graphVariableButon.jqxToggleButton('toggled');
            v.selected = isOn;
            ceui._stations.forEach(function(station) {
                if (isOn) {
                    ceui._showGraph(station, v.id);
                } else {
                    ceui._hideGraph(station, v.id);
                }
            });
        });
    });
};

// ceui._stations is an array that keeps track of the stations for which graphs are currently shown
// Each item in the array is an object of the form
//     { id : STATION_ID, name : STATION_NAME, latlon : STATION_LATLON, $pane : <Object>, mgPanes : <Object> }
//   'id' is a string which is the ID of the station
//   'name' is a string which is the name of the station
//   'latlon' is a string which is the latlon of the station
//   '$pane' is a jQuery object corresponding to the entire UI component for this station; this component
//           is removed from the display when the station is deselected.
//   'mgPanes' is an Object that keeps track of the UI components containing data graphs for this station;
//             the properties of the mgPanes object are (string) variable ids, and each property value is
//             a reference to the UI componen for the graph of that variable
// This array is managed by the functions ceui.showStation() (which adds elements to the array) and
// ceui.hideStation() (which removes elements from the array).
ceui._stations = [];

// Return the station object in the ceui._stations array corresponding to the given station id
ceui._stationById = function(id) {
    var i;
    for (i=0; i<ceui._stations.length; ++i) {
        if (ceui._stations[i].id === id) {
            return ceui._stations[i];
        }
    }
}

// Return the index of the station object in the ceui._stations array corresponding to the given station id
ceui._stationIndexById = function(id) {
    var i;
    for (i=0; i<ceui._stations.length; ++i) {
        if (ceui._stations[i].id === id) {
            return i;
        }
    }
    return -1;
};

// This internal function adds a new component to an existing station pane, and calls the ceui._displayGraph()
// callback to create a Multigraph in that new component.
ceui._showGraph = function(station, variableId) {
    var $mgPane = $(ceui.templates.mgPane).appendTo( station.$pane.find(".mgPanesHolder") );
    $mgPane.find(".stationDataLabel").html(ceui._variableById(variableId).name);
    $mgPane.find(".mgPaneBotContentHold").empty();
    station.mgPanes[""+variableId] = $mgPane;
    ceui._displayGraph(station.id, variableId, $mgPane.find(".mgPaneBotContentHold"));
};

ceui._hideGraph = function(station, variableId) {
    var $mgPane = station.mgPanes[""+variableId];
    $mgPane.remove();
    delete station.mgPanes[""+variableId];
    ceui._removeGraph(station.id, variableId);
};

// increment over stations, set the associated number to match the point label
ceui._setStationNumbers = function() {
    ceui._stations.forEach( function( station, i ) {
        station.$pane.find( '.mgNumber' ).html( sprintf( '(%s)', i + 1 ) );
    });
};

ceui.showStation = function(station) {
    // Create a component for displaying multigraphs for a new station, and call the _displayGraph callback
    // to create and display graphs for all currently selected variables for that station.
    var $stationPane = $(ceui.templates.stationPane);
    $("#multiGrphPanel").jqxPanel('append', $stationPane);
    
    $stationPane.find(".mgTitle").html(station.name);
    $stationPane.find(".mgLatLon").html(station.latlon);
    $stationPane.find(".mgPanesHolder").empty();
    var station = { id : ""+station.id, name : station.name, latlon : station.latlon, $pane : $stationPane, mgPanes : {} };
    ceui._variables.forEach(function(variable) {
        if (variable.selected) {
            ceui._showGraph(station, variable.id);
        }
    });
    ceui._stations.push(station);
    ceui._setStationNumbers();
};

ceui.hideStation = function(id) {
    var stationIndex = ceui._stationIndexById(id);
    if (stationIndex >= 0) {
        ceui._stations[stationIndex].$pane.remove();
        ceui._stations.splice(i,1);
    }
    
    ceui._setStationNumbers();
};

ceui._topicMenuItems = {};

ceui.setTopics = function(topics) {
    $("#menuItemHolder").empty();
    topics.forEach(function(topic) {
        var $menuItem = $(ceui.templates.topicsMenuItem).appendTo($("#menuItemHolder"));
        $menuItem.attr("title", topic.name);
        $menuItem.attr("data-id", topic.id);
        $menuItem.find(".CE_MenuTitleHoldStyle").html(topic.name);
        ceui._topicMenuItems[ topic.id + "" ] = $menuItem;
    });
	$('.CE_MenuContHold').hover(
        function(){
			if(!$(this).hasClass("selected")){
				$(this).css('background-color', '#aaa')
			}
		},
 		function(){
			if(!$(this).hasClass("selected")){
				$(this).css('background-color', '#888')
			}
 			
		}).click(function(){
			$('.CE_MenuContHold').removeClass('selected').css('background-color', '#888');
			$(this).css('background-color', '#aaa');
			$(this).addClass('selected').css('background-color', '#0079A4');
			
			$("#topicsLabel").html($(this).attr('title'));
			$("#menuItemHolder" ).animate({top: "-=232"}, 500);
			$("#holderForAllLayerGroups" ).animate({top: "-=232"}, 500);
			$("#topOpenButt" ).removeClass("isDown");
			$("#openCloseiconHold").attr('src', 'ceui/media/uiGraphics/dwnArrow.png');
            if (ceui._topicSet) {
                ceui._topicSet( $(this).attr("data-id") );
            }
 		});
};

ceui.setTopic = function(id) {
    var $menuItem = ceui._topicMenuItems[ id + "" ];
	$('.CE_MenuContHold').removeClass('selected').css('background-color', '#888');
    $menuItem.addClass('selected').css('background-color', '#0079A4');
	$("#topicsLabel").html($menuItem.attr("title"));
}

ceui._layerGroupLayersHolders = {};

ceui.setLayerGroups = function(layerGroups) {
    var $holderForAllLayerGroups = $("#holderForAllLayerGroups");
    $holderForAllLayerGroups.empty();
    layerGroups.forEach(function(layerGroup) {
        var $layerGroup = $(ceui.templates.layerGroup);
        $layerGroup.appendTo($holderForAllLayerGroups);
        $layerGroup.find(".headerHolder .headerText").html(layerGroup.name);
        var $layerGroupLayersHolder = $layerGroup.find(".layerGroupLayersHolder")
        $layerGroupLayersHolder.jqxPanel({ 
		    width: 406, 
		    height: 177,
		    sizeMode: 'fixed',
		    scrollBarSize:10,
	    });
        ceui._layerGroupLayersHolders[layerGroup.id] = $layerGroupLayersHolder;
    });
    ceui._layers = {};
};

ceui._layers = {};

ceui.setLayers = function(groupId, layers) {
    var $layerGroupLayersHolder = ceui._layerGroupLayersHolders[groupId]
    $layerGroupLayersHolder.jqxPanel('clearContent');

    layers.forEach(function(layer, i) {
        var $layer = $(ceui.templates.layer);
        $layerGroupLayersHolder.jqxPanel('append', $layer);
        ceui._layers[ layer.id ] = $layer;

        var $layerCheck = $layer.find(".layerCheck");
        var $layerOpacSlider = $layer.find(".layerOpacSlider");
        var $layerOpacLab = $layer.find(".layerOpacLab");
        
	    $layerCheck.jqxCheckBox({ width: 300, height: 25, checked: false});
	    $layerCheck.on('change', function(event){
		    var checked = event.args.checked;
		    if(checked){
                $layerOpacSlider.jqxSlider({ disabled : false });
			    $layerOpacLab.show(100);
		    }else{
                $layerOpacSlider.jqxSlider({ disabled : true });
			    $layerOpacLab.hide(100);
		    }
            if (ceui._layerVisibilitySet) {
                ceui._layerVisibilitySet(layer.id, checked);
            }
	    });
        $layerOpacSlider.jqxSlider({
            disabled: true,
		    theme:ceui._myTheme,
		    min: 0, 
		    max: 100, 
		    ticksFrequency: 1, 
		    value: 100, 
		    step: 1,
		    showButtons: false,
		    ticksPosition: 'NONE',
		    width: '100%',
		    showRange: true,
		    tooltip: false
	    });
        
        $layerOpacSlider.on('change', function(event){
		    var opacVal = Math.round(event.args.value);
		    $layerOpacLab.html(opacVal.toString()+"%");
            if (ceui._layerOpacitySet) {
                ceui._layerOpacitySet(layer.id, opacVal/100.0);
            }
	    });
        
        $layerCheck.find(".layerTitle").html(layer.name);
        
    });

};

ceui.setLayerVisibility = function(layerId, visible) {
    var $layerCheck = ceui._layers[ layerId ].find(".layerCheck");
    if (visible) {
        $layerCheck.jqxCheckBox('check');
        ceui._layers[ layerId ].find(".layerOpacSlider").jqxSlider({ disabled : !ceui._enabled });
    } else {
        $layerCheck.jqxCheckBox('uncheck');
    }
};

ceui.setLayerOpacity = function(layerId, opacity) {
    var $layerOpacSlider = ceui._layers[ layerId ].find(".layerOpacSlider");
    var $layerOpacLab = ceui._layers[ layerId ].find(".layerOpacLab");
    $layerOpacSlider.jqxSlider('setValue', opacity*100);
	$layerOpacLab.html((Math.floor(opacity*100)).toString()+"%");
};

ceui.init = function(options) {

    if ('enabled' in options) {
        ceui._enabled = options.enabled;
    }

    ceui._tabSet = options.tabSet;
    ceui._displayGraph = options.displayGraph;
    ceui._removeGraph = options.removeGraph;
    ceui._topicSet = options.topicSet;
    ceui._layerVisibilitySet = options.layerVisibilitySet;
    ceui._layerOpacitySet = options.layerOpacitySet;


    ceui.templates = {};

    ceui.templates.layerGroup = $("#holderForAllLayerGroups .holderForOneLayerGroup")[0].outerHTML;
    ceui.templates.layer = $("#holderForAllLayerGroups .holderForOneLayerGroup .layer")[0].outerHTML;
    ceui.templates.topicsMenuItem = $("#menuItemHolder .CE_MenuContHold")[0].outerHTML;
    ceui.templates.graphVariableButton = $("#multiGrphButtHold .graphVariableButon")[0].outerHTML;
    ceui.templates.stationPane = $("#multiGrphPanel .stationPaneHolder")[0].outerHTML;
    ceui.templates.mgPane = $("#multiGrphPanel .mgPanesHolder .mgPane")[0].outerHTML;

	$("#layerMultiGrphButtGrp").jqxButtonGroup({ theme: ceui._myTheme, mode: 'radio'});
	$("#layerMultiGrphButtGrp").jqxButtonGroup('setSelection', 0);
    if (!ceui._enabled) {
	    $("#layerMultiGrphButtGrp").jqxButtonGroup('disableAt', 0);
	    $("#layerMultiGrphButtGrp").jqxButtonGroup('disableAt', 1);
    }

    $("#mapHolder").empty();
	
	$("#multiGrphHolder").hide();

	// checks whether Maps or Description buttons have been selected, and hides or shows the either
	// the MENU widget and About this Snapshot Panel OR the Description text and About this date slider widget.
	$("#layerMultiGrphButtGrp").click(function(){
		var whichSelect = $("#layerMultiGrphButtGrp").jqxButtonGroup('getSelection');
		if(whichSelect == 0){
			$("#multiGrphHolder").fadeOut(100, function(){
				$("#middleRightHolder").animate({width:"430"}, 400, function(){
					$("#layersHolder").fadeIn(100);
				})
			})
            if (ceui._tabSet) {
                ceui._tabSet(ceui.LAYERS);
            }
		}else if(whichSelect == 1){
			$("#layersHolder").fadeOut(100, function(){
				$("#middleRightHolder").animate({width:"644"}, 400, function(){
					$("#multiGrphHolder").fadeIn(100);
				})
			})
            if (ceui._tabSet) {
                ceui._tabSet(ceui.MULTIGRAPH);
            }
		}
	});
	

    $("#multiGrphPanel").empty();
	$("#multiGrphPanel").jqxPanel({ 
		width: 621, 
		height: 700,
		sizeMode: 'fixed',
		scrollBarSize:10
	});	
	
	$( "#topOpenButt" ).click(function() {
		if($( "#topOpenButt" ).hasClass("isDown")){
			$( "#menuItemHolder" ).animate({top: "-=232"}, 500);
			$( "#holderForAllLayerGroups" ).animate({top: "-=232"}, 500);
			//$( "#bottomer" ).animate({top: "+=128"}, 500)
			$("#openCloseiconHold").attr('src', 'ceui/media/uiGraphics/dwnArrow.png');
			$( "#topOpenButt" ).removeClass("isDown");
		}else{
			$( "#menuItemHolder" ).animate({top: "+=232"}, 500);
			$( "#holderForAllLayerGroups" ).animate({top: "+=232"}, 500);
			//$( "#bottomer" ).animate({top: "-=128"}, 500, function() { 
			$("#openCloseiconHold").attr('src', 'ceui/media/uiGraphics/upArrow.png');
			//});
			$( "#topOpenButt" ).addClass("isDown");
		}
		return false;
	});
	
};

ceui.enabled = function(enabled) {

    if (enabled) {
        // enable the perspective ("Map Layers" vs "Historical Data") buttons:
	    $("#layerMultiGrphButtGrp").jqxButtonGroup('enableAt', 0);
	    $("#layerMultiGrphButtGrp").jqxButtonGroup('enableAt', 1);
        // enabled the checkbox for each layer, and the slider for any layers
        // whose checkbox is checked:
        Object.keys(ceui._layers).forEach(function(layerId) {
            var $layer = ceui._layers[ layerId ];
            var $layerCheck = $layer.find(".layerCheck");
            $layerCheck.jqxCheckBox({disabled: false});
            if ($layerCheck.jqxCheckBox('checked')) {
                var $layerOpacSlider = $layer.find(".layerOpacSlider");
                $layerOpacSlider.jqxSlider({disabled : false});
            }
        });
    } else {
        // disable the perspective ("Map Layers" vs "Historical Data") buttons:
	    $("#layerMultiGrphButtGrp").jqxButtonGroup('disableAt', 0);
	    $("#layerMultiGrphButtGrp").jqxButtonGroup('disableAt', 1);
        // disable the checkbox and slider for each layer
        Object.keys(ceui._layers).forEach(function(layerId) {
            var $layer = ceui._layers[ layerId ];
            var $layerCheck = $layer.find(".layerCheck");
            $layerCheck.jqxCheckBox({disabled : true});
            var $layerOpacSlider = $layer.find(".layerOpacSlider");
            $layerOpacSlider.jqxSlider({disabled : true});
        });
    }

    ceui._enabled = enabled;
}
