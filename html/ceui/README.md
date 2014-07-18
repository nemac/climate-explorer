# Climate Explorer User Interface API

The Climate Explorer User Interface API is a collection of functions and conventions that specifies how the Climate Explorer
application communicates with its user interface.  Adherence to these conventions allows for convenient separation of the
application from the user interface.

The primary rule is that the application and the user interface must *only* communicate with each other through this API.
In no case should code be added to the application which interacts with any UI components directly, other than through the
`ceui` functions described here.  And conversely, the UI should only interact with the application using the "callback" functions
described below.

The proper way to add some kind of interaction between the application and the user interface which is not supported by this
API is to first modify this API (including this documentation file).

## ceui Object

The user interface should expose only one global JavaScript object named `ceui`; all UI functions and variables should
be properties on this object.

## CEUI Initialization, Application Callbacks

The function `ceui.init()` initializes the UI; the application will call it before calling any other UI functions.
It takes a single argument which should be an object with properties that give various "callback" functions.

```javascript
    ceui.init({
        perspectiveSet : function(perspective) {
            // "Perspective" is a term that we use to describe what is on display in the UI's right sidebar.
            // The "layers" perspective corresponds to the "Map Layers" content, and the "graphs" perspective
            // corresponds to the "Historical Data" content.  The UI calls this callback function whenever the
            // user changes the perspective by clicking on one of these buttons.
            // The 'perspective' argument will be one of the following constants:
            //    ceui.LAYERS
            //    ceui.GRAPHS
        },
        layerVisibilitySet : function(id, visible) {
            // The UI calls this function whenever the user checks or unchecks the checkbox
            // to turn a map layer on or off.  'id' will be the id of the affected layer, and
            // 'visible' will be either 'true' or 'false'.
        },
        layerOpacitySet : function(id, opacity) {
            // The UI calls this function whenever the user adjusts the opacity slider
            // for a map layer.  'id' will be the id of the affected layer, and
            // 'opacity' will be the new opacity value, in the range 0.0 (fully transparent)
            // to 1.0 (fully opaque).
        },
        topicSet : function(topicId) {
            // The UI calls this function whenever the user chooses a new topic in the
            // "Topics" menu; "topicId" is the id of the newly selected topic.
        },
        displayGraph : function(stationId, dataVariableId, $element) {
            // The UI calls this function to instruct the application to display a data graph
            // showing data for the given station and data variable;  "$element" will be a jQuery
            // object corresponding to the DOM element where the graph should be displayed.
        },
        removeGraph : function(stationId, dataVariableId) {
            // The UI calls this function to notify the application that a station data graph
            // has been removed from display (this happens, for example, when the user dismisses
            // the graph, or dismisses the entire station, or changes the selection of which
            // data variables should be displayed).
        }
    })
```

The UI will call the callback functions specified in the call to `ceui.init()`
to notify the application when certain events take place, or when the it needs to instruct the
application to perform some kind of action.  Note that in general, the UI only calls these callbacks
when the user performs some action in the (such as clicking a checkbox, or dragging a slider); the callbacks
are not typically called when the corresponding settings are changed programmatically; see the descriptions
of the UI's API functions below for details.

## Enabling the UI

When the user interface is initialized, it will be in a "disabled" state, meaning that its various
buttons, sliders, etc are greyed out and will not respond to user interaction.  The reason for this
is that the application needs time, after it initializes the UI, to finish initializing itself,
before it can be ready for the user to start interacting.  (In particular, creation of the map has
to be delayed until responses to various ajax requests have been received.)  The UI provides the
following function which the application can (and must) call to indicate that it is ready for interaction:

```javascript
    ceui.enabled(BOOLEAN)
```

The application should call `ceui.enabled(true)` to cause the UI to become enabled and to allow the user
to begin interactions.

## Perspectives

We use the term "perspective" to describe what is visible in the UI's right sidebar.  There are two
possible perspectives: "Map Layers", which includes a list of map layers and widgets for controlling them,
and "Historical Data", which includes interactive graphs (multigraphs) of historical station data.
The UI defines the following two constants for dealing with these perspectives:

* `ceui.LAYERS`
* `ceui.GRAPHS`
    
The UI also provides the following function which the application can use to force a specific perspective
to be displayed.  The `perspective` argument should be one of the above constants:

```javascript
    ceui.setPerspective( perspective )
```

Whenever the user changes the perspective manually through the UI, the UI calls the `perspectiveSet()` callback
function mentioned above.  Note that this callback is NOT triggered by a call to `ceui.setPerspective()`.

## Map Layers Perspective

### Topics

The UI provides the following function which the application can use to set the list of topics which appear
in the topics menu:

```javascript
    ceui.setTopics([
       { id: ..., name: ... },
       { id: ..., name: ... },
       ...
    ])
```

The argument to `ceui.setTopics()` should be an array of objects, each containing an `id` and a `name`
property for a topic.  For each topic, the `id` value should be a (short) string which uniquely identifies
the topic, and `name` is the (possibly) longer string to be displayed for that topic in the menu.  The application
may also call

```javascript
    ceui.setTopic( id )
```

to set the current topic.  When the user changes the current topic manually, the UI calls the `topicSet()` callback
mentioned above.  Note that this callback is NOT triggered by a call to `ceui.setTopic()`.

### Map Layers

When the UI is displaying the map layers perspective, it shows a list of map layers displayed in groups.
At the current time the two groups are "Climate Stressors" and "Assets Impacted", but the names of these groups
are not hardwired into the UI --- the application can set them by calling

```javascript
    ceui.setLayerGroups([
      { id: ..., name: ... },
      { id: ..., name: ... },
      ...
    ])
```

The argument to `ceui.setLayerGroups()` should be an array of objects, each containing an `id` and a `name` property
for a group of layers.  For each group, the `id` value should be a (short) string which uniquely identifies
the topic, and the `name` property is the (possibly) longer string to be displayed for that group.  Calling
`ceui.setLayerGroups()` will cause the UI to remove all current layer widgets from display --- the new layer groups
will initially contain no layers.  The application can then populate the new groups with layers by calling
  
```javascript
    ceui.setLayers(groupId,
      [{ id: ..., name: ..., visible: ..., opacity: ... },
       { id: ..., name: ..., visible: ..., opacity: ... },
       ...
    ])
```

The argument to `ceui.setLayers()` should be an array of objects containing the properties `id`, `name` which
give a short identifier, and a public displayed name, for each layer, as well as a `visible` property which has
a boolean value indicating whether the layer should initially be visible or not, and an `opacity` property which
gives its opacity, as a number between 0.0 (fully transparent) and 1.0 (fully opaque).

The UI provides the following functions which the application can use to programmatically change the visibility
or opacity of a layer after it has been initialized:

```javascript
    ceui.setLayerVisibility(layerId, BOOLEAN)
    ceui.setLayerOpacity(layerId, opacity)
```

Whenever the user adjust the visibility or opacity of a layer through the user interface, the UI calls the
`layerVisibilitySet()` or `layerOpacitySet()` callbacks mentioned above.  Note that these callbacks are NOT
triggered by calls to `ceui.setLayerVisibility()` or `ceui.setLayerOpacity()`.

## Graphs Perspective

### Data Variables

In the graphs perspective, the UI presents the user with a set of possible data variables that can be
graphed.  Currently there are two of these, "temperature" and "precipitation", but the program design allows
for an arbitrary number of them.  The UI provides the following function which the application can use to set
the list of these variables:

```javascript
    ceui.setDataVariables([
        { id : ..., name : ..., selected : BOOLEAN },
        { id : ..., name : ..., selected : BOOLEAN },
        ...
    ])
```

The argument to `ceui.setDataVariables()` is an array with `id`, `name`, and `selected` properties.  The
`id` is, of course, an short unique identifier for the variable; `name` is the name that the UI displayed for
the variable, and `selected` indicates whether that variable should be initially selected.

### Data Graphs

The UI provides the following functions which the application can use to control which data graphs are
displayed:
                 
```javascript
    ceui.showStation({ id: ..., name : ... })
```

`ceui.showStation()` takes a single argument which is an object giving the `id` and `name` of a station;
it causes the UI to create a space in the graphs perspective for displaying data graphs for that station.
It also causes the UI to call the `displayGraph()` callback mentioned above for this station with each
currently selected data variable.

The following function, which takes a single station `id` argument, causes the UI to remove all data graphs
(as well as the title) corresponding to the given station:
   
```javascript
    ceui.hideStation(id)
```

## The Map

The Climate Explorer's map is part of the application itself, not the UI.  The UI simply needs to provide
a DOM element that the application can use for displaying the map.  The following function, which takes
no arguments, returns a jQuery object corresponding to the DOM element where the map should be placed:

```javascript
    ceui.getMapElement()
```
