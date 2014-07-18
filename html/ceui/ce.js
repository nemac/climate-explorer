$(document).ready(function() {

    ceui.init({
        tabSet : function(tab) {
            console.log('switching to tab: ' + tab);
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
    ], {
        topicSet : function(topicId) {
            console.log('topic changed to: ' + topicId);
        }
    });		

    ceui.setTopic("coastal");

    ceui.setLayerGroups([
        { id: "stress", name: "MY STRESSORS" },
        { id: "asset",  name: "MY ASSETS" }
    ], {});

    function setLayerVisibility(id, visible) {
        console.log('layer ' + id + ' visibility set to ' + visible);
    }

    function setLayerOpacity(id, opacity) {
        console.log('layer ' + id + ' opacity set to ' + opacity);
    }

    ceui.setLayers("stress", [
        { id : 0, name : "My Stressor Layer Title One" },
        { id : 1, name : "My Stressor Layer Title Two" },
        { id : 2, name : "My Stressor Layer Title Three" },
        { id : 3, name : "My Stressor Layer Title Four" },
        { id : 4, name : "My Stressor Layer Title Five" },
        { id : 5, name : "My Stressor Layer Title Six" },
        { id : 6, name : "My Stressor Layer Title Seven" }
    ], {
        'setLayerVisibility' : setLayerVisibility,
        'setLayerOpacity' : setLayerOpacity
    });

    ceui.setLayers("asset", [
        { id : 0, name : "My Asset Layer Title One" },
        { id : 1, name : "My Asset Layer Title Two" },
        { id : 2, name : "My Asset Layer Title Three" },
        { id : 3, name : "My Asset Layer Title Four" },
        { id : 4, name : "My Asset Layer Title Five" }
    ], {
        'setLayerVisibility' : setLayerVisibility,
        'setLayerOpacity' : setLayerOpacity
    });

    ceui.setVariables([
        { id : "temp", name : "TEMPERATURE" },
        { id : "precip", name : "PRECIPITATION" }
    ], {
        displayGraph : function(stationId, variableId, $domElement) {
            if (variableId === "temp") {
                $('<img src="media/multigraphImg/mgTempImgDummy1.png"></img>').appendTo($domElement);
            } else {
                $('<img src="media/multigraphImg/mgPrecipImgDummy1.png"></img>').appendTo($domElement);
            }
        },
        removeGraph : function(stationId, variableId) {
        }
    });

    ceui.showStation({ id : "STA1", name : "TEST STATION 1", latlon : "xyzzy 0 0 9" });
    ceui.showStation({ id : "STA2", name : "TEST STATION 2", latlon : "xyzzy 1 1 9" });

    $('<img src="media/uiGraphics/dummyMap.png"></img>').appendTo(ceui.getMapElement());

});
