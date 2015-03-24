# Climate Explorer

Climate Explorer is an interactive map application built on top of mapLite 
and displays real-time data from each station selected.


## Hosting and Application Dependencies
It can be assumed that at any major milestone, the latest source has been built and committed to the html directory. This is the code that needs to be hosted on a web server to be served to clients.

As the application is all static HTML, JS, CSS, and configuration files and assets, the contents of the html directory need only to be placed in a publicly accessible manner on a web server for the application to work. Once users navigate to the index.html file, the scripts within take care of the rest of the application logic. The application runs entirely in the client's browser, but does depend on external web services for map data.

## Configuration
The config.json file provides handles most data configuration for the application.
It contains five main categories of configuration:

### Path to data and normals CSV files (output from Geogaddi)
There are two paths to configure to tell Climate Explorer where to find the CSV files that drive the Multigraphs that appear when a station pin is selected.

```json
  "stationData": {
    "baseCsvSourceUrl": "path to data CSV files (YTD precip, min temp, etc)",
    "normalsCsvSourceUrl": "path normals to CSV files"
  }
```

### Station point data
This parameter describes the station JSON file.

```json
  "stations": {
    "data": "path to station JSON file",
    "name": "human-readable name for the stations data"
    "id": "internal unique ID for the stations data",
    "projection": "EPSG projection for the coordinates defined by the station data"
  }
```

The stations JSON file is one large array of elements that appear as follows:

```json
{
  "id": "Station ID that is the link to the CSVs output by Geogaddi",
  "lat": 45.3167,
  "lon": -95.6167,
  "name": "Name to appear when the station is selected",
  "weight":1
}
```

The weight attribute is used to limit the number of stations that appear at given zoom levels. The application is currently configured with the following weights:

1. Appears at all zoom levels
2. Appears at a zoom level of 6 or higher
3. Appears at a zoom level of 8 or higher
4. Appears at a zoom level of 10 or higher
5. Appears at a zoom level of 12 or higher

### Base layers for the map
The base layers are the base maps that appear under all overlays. The "bases" property is an array of elements formatted as follows:

```json
{
  "id": "base layer ID",
  "type": "arcgis: for ESRI-formatted tile cache; or don't provide this property for an OpenStreetMap XYZ formatted base layer",
  "name": "human-readable name for the base layer",
  "url": "path to the base layer service",
  "infoCache": "arcgis-formatted base layers require a request to be made that provides metadata for the base layer, this is a path to a local cached copy to make the map render faster",
}
```

### Overlays for the map
The overlays appear on top of the base maps. The "overlays" property is an array of elements formatted as follows:

```json
{
  "id": "overlay ID",
  "name": "human-readable name for the overlay, appears in layer picker",
  "url": "path to the overlay service",
  "layers": "comma-separated list of layers to be included from the service"
  "projection": "EPSG for the service, if differs from that of the basemap which is defined by the stations projection above",
  "type": "REST: for ESRI-formatted REST endpoint; or don't provide this property for WMS",
  "info": {
    "sourceUrl": "URL for source link when the info button is selected for this layer",
    "sourceEntity": "agency name that will appear as the text for the link above",
    "layerDescription": "free-form text to describe the layer",
    "legendImage": "path to legend image that should render in the info box"
  }
}
```

### Grouping for overlays into topics and subtopics
The overlays described above do not appear on the map by default. A reference to the layer ID must be provided in a group for it to be selectable in the layer selector. This has the added benefit of allowing overlays to be defined once but used in many groups. The "groups" property is an array of elements formatted as follows:

```json
{
  "id": "group ID",
  "name": "human-readable name for the group, appears as a topic name",
  "isDefault": "this will be the initially selected topic unless one is specified in the URL",
  "subGroups": [ // note that this is an array, so more than one can be specified
    {
      "id": "subgroup ID",
      "name": "human-readable name for the subgroup, appears in the layer list",
      "layers": ["array of layer ids from overlays defined above", ...]
    } ...
  ]
}
```

## Building
### Build Dependencies
- jQuery
- mapLite
- drawerPanel
- Multigraph

Building requires node, npm

Initial setup (to get bower and gulp):
```javascript
npm install
bower update
```

Once the environment is set up, build the application with:
```javascript
gulp
```

If the library source needs to be updated, run
```javascript
bower update
```
before build.

To build out a hostable snapshot of the application use the build command:
```javascript
gulp html
```

This outputs a built copy of the application to the html directory. 

