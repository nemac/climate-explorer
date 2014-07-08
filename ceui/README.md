ceui object:

ceui.init({
  tabSet : function( ceui.LAYERS | ceui.MULTIGRAPH )
});

ceui.setTab( ceui.LAYERS | ceui.MULTIGRAPH );

ceui.setTopics([
   { id: ..., name: ... },
   { id: ..., name: ... },
   { id: ..., name: ... }
   ...], {
     topicSet: function( id ) {}
   });

ceui.setTopic( id );

ceui.setLayerGroups([
  { id: ..., name: ... },
  { id: ..., name: ... }
  ...])
  
ceui.setLayers(groupId,
  [{ groupId: ..., id: ..., name: ..., visible: ..., opacity: ... },
   { groupId: ..., id: ..., name: ..., visible: ..., opacity: ... }
   ...],
  {
    layerVisibilitySet : function(id, visible),
    layerOpacitySet : function(id, opacity)
  })

ceui.setLayerVisibility(layerId, BOOLEAN);
ceui.setLayerOpacity(layerId, opacity);

ceui.getMapElement(): returns a JQuery object corresponding to the DOM element where the map
                 should be placed
                 
                 
                 
------------------------------------------------------------------------
multigraph stuff:

callbacks:

ceui.setVariables([
    { id : ..., name : ..., selected : BOOLEAN },
    { id : ..., name : ..., selected : BOOLEAN }
  ] {
    variablesSet : function(variables),
    displayGraph(stationId, variableId, domElement)
  });

ceui.showStation({ id: ..., name : ... })
   displays a container for showing data graphs from the given station; causes
   displayGraph() callback above to be called for any graphs that should be
   displayed for the station
   
ceui.hideStation(id)
   removes the container for showing data graphs for the station with the given id
