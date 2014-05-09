
//
// RDV Permalink object
//
// This object provides a convenient API for translating between permalink URLs and
// application state.
// 
// Usage:
//    var pl = Permalink(URL(window.location.toString()));
//
function Permalink(url) {
    var center = null, zoom = null, gp = null;
    var graphs = [];
    var scales = {};
    if ('zoom' in url.params) {
        zoom = parseInt(url.params.zoom, 10);
    }
    if ('center' in url.params) {
        center = url.params.center.split(',').map(function(s) { return parseFloat(s); });
    }
    if ('gp' in url.params) {
        var fields = url.params.gp.split(':');
        gp = {
            'open'  : parseInt(fields[0],10) !== 0
        }
        if (fields.length > 1) {
            gp.width = parseInt(fields[1],10);
        }
    }
    if ('graphs' in url.params) {
        url.params.graphs.split(',').forEach(function(graphString) {
            var fields = graphString.split(':');
            graphs.push({id:fields[0], type:fields[1]});
        });
    }
    if ('scales' in url.params) {
        url.params.scales.split(',').forEach(function(scale) {
            var fields = scale.split(':');
            scales[fields[0]] = { min : fields[1], max : fields[2] };
        });
    }
    return {
        'toString' : function() { return url.toString(); },
        'haveCenter' : function() { return center !== null; },
        'getCenter'  : function() { return center; },
        'setCenter'  : function(c) {
            center = c;
            url.params.center = center[0] + "," + center[1];
        },
        'haveZoom' : function() { return zoom !== null; },
        'getZoom'  : function() { return zoom; },
        'setZoom'  : function(z) {
            zoom = z;
            url.params.zoom = zoom.toString();
        },
        'haveGp'   : function() { return gp !== null; },
        'getGp'    : function() { return gp; },
        'setGp'    : function(g) {
            gp = g;
            url.params.gp = gp.open ? "1" : "0";
            if ('width' in gp) {
                url.params.gp = url.params.gp + ":" + gp.width;
            }
        },
        'haveGraphs' : function() { return graphs.length > 0; },
        'getGraphs' : function() { return graphs; },
        'addGraph' : function(graph) {
            var i;
            // don't add this graph if it's already in the list
            for (i=0; i<graphs.length; ++i) {
                if (graphs[i].id === graph.id && graphs[i].type == graph.type) {
                    return;
                }
            }
            graphs.push(graph);
            url.params.graphs = graphs.map(function(g) { return g.id + ":" + g.type; }).join(",");
        },
        'removeGraph' : function(graph) {
            var i, j, k =-1;
            for (i = 0; i < graphs.length; ++i) {
                for ( k = 0; k < graph.types.length; k++ ) {
                    if (graphs[i].type === graph.types[k] && graphs[i].id === graph.id) {
                        j = i;
                        break;
                    }
                }
                
            }
            if (j >= 0) {
                graphs.splice(j,1);
            }
            if (graphs.length > 0) {
                url.params.graphs = graphs.map(function(g) { return g.id + ":" + g.type; }).join(",");
            } else {
                delete url.params.graphs;
            }
        },
        'setScales' : function(aR) {
            var bindingId;
            for (bindingId in aR) {
                if (!(bindingId in scales)) {
                    scales[bindingId] = {};
                }
                scales[bindingId].min = aR[bindingId].min;
                scales[bindingId].max = aR[bindingId].max;
            }
            url.params.scales = Object.keys(scales).map(function(bindingId) {
                return bindingId.replace("-binding", "") + ":" + scales[bindingId].min + ":" + scales[bindingId].max;
            }).join(",");
        },
        'haveScales' : function() {
            return Object.keys(scales).length > 0;
        },
        'getScales' : function() { return scales; }
    };
}

//
// URL utility object
// 
// Call this function to create a URL utility object.  Returns an object containing properties
// that make it convenient to access and/or construct parts of a URL.
// 
// For example:
// 
//     // accessing parts of an existing URL:
//     var url = URL({url: "http://www.example.com/look/ma?x=no&y=hands"});
//     console.log(url.baseurl);    // ==> "http://www.example.com/look/ma"
//     console.log(url.params);     // ==> { 'x' : 'no', 'y' : 'hands' }
//     console.log(url.toString()); // ==> "http://www.example.com/look/ma?x=no&y=hands"
// 
//     // constructing a new url:
//     var url = URL({baseurl: "http://www.example.com/look/ma"});
//     url.params.x = 42;
//     url.params.y = 101;
//     url.params.fred = 'yes';
//     console.log(url.toString()); // ==> "http:www.example.com/look/ma?x=42&y=101&fred=yes"
//
function URL(options) {
    var paramstring, params, url, i, name, value;
    var obj = {
        'params' : {},
        'baseurl' : null,
        'toString' : function() {
            var prop, vals = [];
            for (prop in obj.params) {
                vals.push(prop + '=' + obj.params[prop]);
            }
            return obj.baseurl + '?' + vals.join("&");
        }
    };

    if ('url' in options) {
        url = options.url;

        i = url.indexOf('?');
        if (i < 0) {
            obj.baseurl = url;
            paramstring = "";
        } else {
            obj.baseurl = url.substring(0,i);
            paramstring = url.substring(i+1); // Remove everything up to and including the first '?' char.
        }

        if (paramstring.length > 0) {
            paramstring.split('&').forEach(function(c) {
                i = c.indexOf('=');
                if (i >= 0) {
                    name = c.substring(0,i);
                    value = c.substring(i+1);
                } else {
                    name = c;
                    value = null;
                }
                obj.params[name] = value;
            });
        }
    } else if ('baseurl' in options) {
        url = options.baseurl;
        i = url.indexOf('?');
        if (i < 0) {
            obj.baseurl = url;
        } else {
            obj.baseurl = url.substring(0,i);
        }
    }

    return obj;
}