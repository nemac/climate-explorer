# Development environment
To setup your development environment use `npm install`. Additionally, for now you install php and php-cgi.


# Notes/TODO
## dynamic PHP -> PHP templating only -> HTML
- Eliminate usages of `functions.php`
- Simplify `header.php`, `footer.php`, etc
- Create an inventory of all state-related query string variables
- Move state query-string variables to a single client-side module
- Replace all references to `$currentDomain` with `/` (watching for places which need client-side handling)
- Setup client-side breadcrumb handling/replace uses of variables like `$city`, `$county`, etc with client-side state handling.
- Client side meta/head handling

## bugs
- Secondary nav wraps out of container on medium width displays.

## improvements
- caching for stations data
- minification for js dependencies
- 

