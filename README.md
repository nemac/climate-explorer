# Regional Data Viewer

Regional Data Viewer is an interactive map application built on top of mapLite 
and displays real-time data from each station selected.

## Dependencies
- jQuery
- mapLite
- drawerPanel
- Multigraph

Building requires node, npm

Initial setup (to get bower and gulp):
```javascript
npm i -g bower
npm i -g gulp
npm i -D gulp
```

Required for rdv:
```javascript
npm i -D gulp-util gulp-concat gulp-bower gulp-uglify streamqueue gulp-filter gulp-flatten gulp-minify-css gulp-inject
```

Once the environment is setup, installing is as simple as typing
```javascript
gulp
```
on the command line, and the source is built!

If the library source needs to be updated, run
```javascript
bower update
```
before build.

## Todo

### 0.1
- Document
- Add some visual effects to link the graph to the points
  - Maybe mouseover graph and the corresponding marker gets larger?
  - Maybe make the border around the graph get bigger when mouseover the point?
- Further encapsulate additional OpenLayers-specific map functionality

## Credits
- Remove element icon is "Cross Icon" from FamFamFam Silk Icons
