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
        { id : "stress-0", name : "My Stressor Layer Title One" },
        { id : "stress-1", name : "My Stressor Layer Title Two" },
        { id : "stress-2", name : "My Stressor Layer Title Three" },
        { id : "stress-3", name : "My Stressor Layer Title Four" },
        { id : "stress-4", name : "My Stressor Layer Title Five" },
        { id : "stress-5", name : "My Stressor Layer Title Six" },
        { id : "stress-6", name : "My Stressor Layer Title Seven" }
    ]);

    ceui.setLayers("asset", [
        { id : "asset-0", name : "My Asset Layer Title One" },
        { id : "asset-1", name : "My Asset Layer Title Two" },
        { id : "asset-2", name : "My Asset Layer Title Three" },
        { id : "asset-3", name : "My Asset Layer Title Four" },
        { id : "asset-4", name : "My Asset Layer Title Five" }
    ]);

    ceui.setDataVariables([
        { id : "temp",   name : "TEMPERATURE",   selected: true},
        { id : "precip", name : "PRECIPITATION", selected: true}
    ]);

    ceui.showStation({ id : "STA1", name : "TEST STATION 1" });
    ceui.showStation({ id : "STA2", name : "TEST STATION 2" });

    ceui.getMapElement().append( $('<img src="media/uiGraphics/dummyMap.png"></img>') );

    ceui.enabled(true);
});
