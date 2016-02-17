# Using Roboto font in multigraph


1. Load the Google Web Font Loader JS library in the containing HTML page: 
   ```html
   <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js"></script>
   ```

2. Call the `WebFont.load` function as follows:
   ```javascript
    WebFont.load({
        google: {
            families: ['Roboto']
        },
        active: function() {
          // put your code here to create the multigraph
        }
    });
    ```
    Note that the code that creates the multigraph needs to happen in WebFont.load's "active"
    callback --- this ensures that the graph won't be drawn until the font has finished loading.
    Note that putting the graph creation in a jquery document.ready function is apparently
    not sufficient for this --- fonts might not be finished loading at that point.
    
Note that you can also explicitly load the Roboto font elsewhere in the page, which may speed
up the font loading if you store a local copy of it.  Here are 3 ways to do that:

1. Include the following link in the `<head>` of the page: 
   ```html
   <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
   ```

2. Include the following css snippet somewhere in the page's css (this snippet is
   exactly what is returned by the URL `http://fonts.googleapis.com/css?family=Roboto` above): 
   ```css
   @font-face {
     font-family: 'Roboto';
     font-style: normal;
     font-weight: 400;
     src: local('Roboto'), local('Roboto-Regular'), url(http://fonts.gstatic.com/s/roboto/v15/zN7GBFwfMP4uA6AR0HCoLQ.ttf) format('truetype');
   }
   ```

3. Store a local copy of the file `zN7GBFwfMP4uA6AR0HCoLQ.ttf` from the above, and include the
   following css snippet somewhere in the page's css (this is exactly the same as the above,
   but uses the local copy of the ttf, so this version will work without internet access:
   ```css
   @font-face {
     font-family: 'Roboto';
     font-style: normal;
     font-weight: 400;
     src: local('Roboto'), local('Roboto-Regular'), url(zN7GBFwfMP4uA6AR0HCoLQ.ttf) format('truetype');
   }
