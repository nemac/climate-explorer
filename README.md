# Climate Explorer

Climate Explorer is an interactive map application built on top of mapLite 
and displays real-time data from each station selected.


## Hosting and Application Dependencies
It can be assumed that at any major milestone, the latest source has been built and committed to the html directory. This is the code that needs to be hosted on a web server to be served to clients.

As the application is all static HTML, JS, CSS, and configuration files and assets, the contents of the html directory need only to be placed in a publicly accessible manner on a web server for the application to work. Once users navigate to the index.html file, the scripts within take care of the rest of the application logic. The application runs entirely in the client's browser, but does depend on external web services for map data.

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
