$(document).ready(function() {

    ceui.init({
        perspectiveSet : function(perspective) {
            console.log('switching to perspective: ' + perspective);
        },
        layerVisibilitySet : function(id, visibile) {
            console.log('layer ' + id + ' visibility set to: ' + visibile);
        },
        layerOpacitySet : function(id, opacity) {
            console.log('layer ' + id + ' opacity set to: ' + opacity);
        },
        topicSet : function(topicId) {
            console.log('topic set to: ' + topicId);
        },
        displayGraph : function(stationId, variableId, $domElement) {
            if (variableId === "temp") {
                $('<img src="media/multigraphImg/mgTempImgDummy1.png"></img>').appendTo($domElement);
            } else {
                $('<img src="media/multigraphImg/mgPrecipImgDummy1.png"></img>').appendTo($domElement);
            }
        },
        graphRemoved : function(stationId, variableId) {
            console.log('graph for station ' + stationId + ', variable ' + variableId + ' removed');
        },
        stationRemoved : function(stationId) {
            console.log('station removed: ' + stationId);
        }
    });

    ceui.setTopics([
        { id : "coastal",        name: "COASTAL FLOODING" },
        { id : "ecosystem",      name: "ECOSYSTEM VULNERABILITY" },
        { id : "food",           name: "FOOD RESILIENCE" },
        { id : "human",          name: "HUMAN HEALTH" },
        { id : "infrastructure", name: "INFRASTRUCTURE AND ENERGY SUPPLY" },
        { id : "transportation", name: "TRANSPORTATION AND SUPPLY CHAIN" },
        { id : "water",          name: "WATER RESOURCES" },
        { id : "all",            name: "ALL TOPICS" }
    ]);		

    ceui.setTopic("coastal");

    ceui.setLayerGroups([
        { id: "stress", name: "MY STRESSORS" },
        { id: "asset",  name: "MY ASSETS" }
    ]);

    ceui.setLayers("stress", [
        { id : "stress-0", name : "Coastal Flood Hazard Composite (DEL-NJ-NY)",
          info : {
              sourceUrl : "http://www.csc.noaa.gov",
              sourceEntity : "NOAA Coastal Services Center",
              layerDescription : "This layer shows flood hazard composite information for Delaware, New Jersey, and New York.  This description might contain more information, and might possibly consist of two or three sentences.",
              legendImage : "media/sampleLegends/legend1.png"
          }
        },
        { id : "stress-1", name : "My Stressor Layer Title Two",
          info : {
              sourceUrl : "http://www.ncdc.noaa.gov",
              sourceEntity : "NOAA National Climatic Data Center",
              layerDescription : "This layer shows some colors which indicate...",
              legendImage : "media/sampleLegends/legend2.png"
          }
        },
		{ id : "stress-2", name : "My Stressor Layer Title Three",
          info : {
              sourceUrl : "http://www.ncdc.noaa.gov",
              sourceEntity : "NOAA National Climatic Data Center",
              layerDescription : "This layer shows some colors which indicate...",
              legendImage : "media/sampleLegends/legend2.png"
          }
        },
		{ id : "stress-3", name : "My Stressor Layer Title Four",
          info : {
              sourceUrl : "http://www.ncdc.noaa.gov",
              sourceEntity : "NOAA National Climatic Data Center",
              layerDescription : "This layer shows some colors which indicate...",
              legendImage : "media/sampleLegends/legend2.png"
          }
        },
		{ id : "stress-4", name : "My Stressor Layer Title Five",
          info : {
              sourceUrl : "http://www.ncdc.noaa.gov",
              sourceEntity : "NOAA National Climatic Data Center",
              layerDescription : "This layer shows some colors which indicate...",
              legendImage : "media/sampleLegends/legend2.png"
          }
        }
    ]);

    ceui.setLayers("asset", [
        { id : "asset-0", name : "My Asset Layer Title One" },
        { id : "asset-1", name : "My Asset Layer Title Two" },
        { id : "asset-2", name : "My Asset Layer Title Three" },
        /*{ id : "asset-3", name : "My Asset Layer Title Four" },
        { id : "asset-4", name : "My Asset Layer Title Five" }*/
    ]);

    ceui.setDataVariables([
        { id : "temp",   name : "TEMPERATURE",   selected: true},
        { id : "precip", name : "PRECIPITATION", selected: true}
    ]);

    ceui.setLayerVisibility("stress-0", true);

    ceui.selectLayerInfo("stress-0");

    ceui.showStation({ id : "STA1", name : "TEST STATION 1" });
    ceui.showStation({ id : "STA2", name : "TEST STATION 2" });

    ceui.getMapElement().append( $('<img src="media/uiGraphics/dummyMap.png"></img>') );

    ceui.enabled(true);
});
