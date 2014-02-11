# Regional Data Viewer

Regional Data Viewer is, at its core, a reusable jQuery UI Widget that defines a
lightweight map. Some surrounding elements are included that implement the map.

## Dependencies
- jQuery
- jQuery UI
- Mustache

## Documentation

```javascript
.drawerPanel( options )
```

Takes the contents of a div and moves them into a collapsible sliding side panel. 

### Options
There are several options to customize the behavior of drawerPanel.

- **position** side of the screen to render the panel
  - "left" or "right" ("right")
- **state** initial state of the plugin after creation
  - "opened" or "closed" ("opened")
- **resizable** can the opened panel be dragged and resized
  - Boolean (false)
- **width** initial width of the opened panel
  - int (300)
- **minWidth** minimum width constraint if **resizable** is true
  - int (200)
- **maxWidth** maximum width constraint if **resiable** is true
  - int (600)
- **color** hex color for the background of the panel and the corresponding opener button
  - "#..." ("#eef")
- **templateLocation** allows the user the specify a custom template for the markup that is used for the widget (a default is provided and rendered with Mustache)
  - url string to the Mustache template (panel.tpl.html)
- **title**
  - string ("Title")
- **openerImage** this image fills the contents of the opener button that appears when the panel is closed
  - url string to the image (icons/Open_Right.png)
- **openerHeight** height the button should be (any image used should drive this)
  - int (110)
- **animationDuration** milliseconds the animation should take when opening or closing the panel
  - int (400)

### Public methods
```javascript
.drawerPanel( 'close', doImmediately )
```
Causes the panel to close. doImmediately is a Boolean that indicates if the animation should be skipped.

```javascript
.drawerPanel( 'open', doImmediately )
```
Causes the panel to open. doImmediately is a Boolean that indicates if the animation should be skipped.

```javascript
.drawerPanel( 'togglePanelState', doImmediately )
```
Causes the panel to toggle its state (close if it is opened and vice versa). doImmediately is a Boolean that indicates if the animation should be skipped.

```javascript
.drawerPanel( 'setContents', contents )
```
Changes the contents of the panel to the new contents provided (html is supported).

---

## Todo

### 0.1
- Document the code
- Allow a callback to be registered with the conclusion of resizing
- Return state (open/closed)
- Add license?
- Change STATES.OPENED = 'opened', not 'open'