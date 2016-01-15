/*var json = {
    "string": "foo",
    "number": 5,
    "array": [1, 2, 3],
    "object": {
        "property": "value",
        "subobj": {
            "arr": ["foo", "ha"],
            "numero": 1
        }
    }
};
*/
function printJSON() {
    $('#json').val(JSON.stringify(json));

}

function updateJSON(data) {
    json = data;
    printJSON();
}

function showPath(path) {
    $('#path').text(path);
}

$(document).ready(function() {

    $('#rest > button').click(function() {
        var url = $('#rest-url').val();
        $.ajax({
            url: url,
            dataType: 'jsonp',
            jsonp: $('#rest-callback').val(),
            success: function(data) {
                json = data;
                $('#editor').jsonEditor(json, { change: updateJSON, propertyclick: showPath });
                printJSON();

                var iframe = document.getElementById("ifr").contentWindow;
                $("#ifr").css({height: iframe.$("body").outerHeight()});
            },
            error: function() {
                alert('Something went wrong, double-check the URL and callback parameter.');
            }
        });
    });

    $('#json').change(function() {
        var val = $('#json').val();

        if (val) {
            try { json = JSON.parse(val); }
            catch (e) { alert('Error in parsing json. ' + e); }
        } else {
            json = {};
        }

        var iframe = document.getElementById("ifr").contentWindow;
        $("#ifr").css({height: iframe.$("body").outerHeight()});

        $('#editor').jsonEditor(json, { change: updateJSON, propertyclick: showPath });
    });

    $('#expander').click(function() {
        var editor = $('#editor');
        editor.toggleClass('expanded');
        $(this).text(editor.hasClass('expanded') ? 'Collapse' : 'Expand all');
        var iframe = document.getElementById("ifr").contentWindow;
        $("#ifr").css({height: iframe.$("body").outerHeight()});

    });
    
    printJSON();
    $('#editor').jsonEditor(json, { change: updateJSON, propertyclick: showPath });
});


