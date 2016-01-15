$(document).ready(function () {
    location.hash && $(location.hash + '.collapse').collapse('show');
});

$('#accordion').on('show.bs.collapse', function () {
    $('#accordion .in').collapse('hide');
});

$(".panel-group").children().click(function (e) {
    if ($(e.currentTarget).siblings().children(".collapsing").length > 0 ) {
        return false;
    }
});
