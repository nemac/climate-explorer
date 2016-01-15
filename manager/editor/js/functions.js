//CONFIG-----------
//var docRoot = 'files/'; //example 'files/'
//var currentTheme = "ambiance";
//END CONFIG-------
//-------------------
docRoot = "../../" + docRoot ; // Necesary
var editor = Array();
var files = Array();
var tabCont = 0;
var currentDir = "";
var currentFile = "";
var currentTab = 0;
var currentTabName = "";
var tabs = Array();
var tabSaved = Array();
//var autoSave = false;
var tryToSave = false;
var saving = false;
var isCurrentFile = false;
$(document).ready(function () {
    //upload
    var htmlUpload = "";
    var uploadButton = $('#upload');
    if(currentDir == ""){
        dir = docRoot;
    }else{
        dir = currentDir;
    }
    
    if(uploadButton.length > 0){
        new AjaxUpload(uploadButton,  {
            action: 'upload/upload-handler.php',
            name: 'userfile',
            data: {
                path: dir
            },
            onSubmit : function(file, ext){
                htmlUpload = $('#upload').html();
                $('#upload').html("<span id='uploading'></span>uploading");
                this.disable();
            },
            onComplete: function(file, response){
                $('#upload').html(htmlUpload);
                reloadTree();
                this.enable();
            }
        });
    }
    if(localStorage["theme"] != undefined){
        currentTheme = localStorage["theme"];
        $(".theme").removeClass("selected");
        $("#"+currentTheme).toggleClass("selected");
    }
    if(localStorage["autoSave"] != undefined){
        if(localStorage["autoSave"] == "true"){
            autoSave = true;
            $("#autosave").addClass("selected");
        }else{
            autoSave = false;
            $("#autosave").removeClass("selected");
        }
    }
    if(localStorage["wrap"] != undefined){
        if(localStorage["wrap"] == "true"){
            wrap = true;
            $("#wrap").addClass("selected");
        }else{
            wrap = false;
            $("#wrap").removeClass("selected");
        }
    }
    var currentFile = "";
    $(function() {
        $( "#browser" ).resizable({
            handles: "e"
        });
    });
    $(".theme").click(function(){
        $(".theme").removeClass("selected");
        $(this).toggleClass("selected");
    });
    $("#autosave").click(function(){
        $("#autosave").toggleClass("selected");
        autoSave = $("#autosave").hasClass("selected");
        localStorage["autoSave"] = autoSave;
        
    });
    $("#wrap").click(function(){
        $("#wrap").toggleClass("selected");
        wrap = $("#wrap").hasClass("selected");
        localStorage["wrap"] = wrap;
        if($("a.selected.aTab").length != 0){
            window['cm_'+currentTabName].lineWrapping = wrap;
            window['cm_'+currentTabName].refresh();
        }
    });
    
    var saveTimer = setInterval(autoSaveTimer(), 2000);
    function autoSaveTimer(){
        if(autoSave){
            save();
        }
    }
    $("#config").click(function(){
        $("#configMenu").slideToggle();
        return false;
    });
    $("#refresh").click(function(){
        reloadTree();
        return false;
    });

    $("#exit").click(function(){
        window.location = "exit.php";
        return false;
    });
    $("#delete").click(function(){
        if(!isCurrentFile){
            log("No file selected");
            return false;
        }
        if(currentFile == ""){
            log("No file selected");
            return false;
        }
        var filename = currentFile.replace(/^.*[\\\/]/, '');
        $("#dialogYesNo").html("Do you want to delete "+filename+" ?");
        var dlg = jQuery("#dialogYesNo").dialog({
            title: "Confirm deletion",
            disabled: false,
            modal: true,
            buttons: {
                "Cancel": function() {
                    $(this).dialog("close");
                },
                "Delete": function() {
                    $(this).dialog("close");
                    $.post('browser/file_delete.php', {
                        "f": currentFile,
                        "t": isCurrentFile
                    }, function(data){
                        if(data != "{false}"){
                            reloadTree();
                            log("deleted");
                        }else{
                            log("Error deleting file");
                        }
                        saving = false;
                        if(tryToSave){
                            save();
                        }
                        tryToSave = false;
                        return false;
                    });
                }
            },
            resizable: false
        });
        
    });
    $("#root").click(function(){
        $("li.directory a,li.file a").removeClass('fileSelected');
        currentDir = docRoot;
        isCurrentFile = false;
        $(this).toggleClass("fileSelected");
        updateUpload();
        return false;
    });
    $("#rename").click(function(){
        if(!isCurrentFile){
            log("No file selected");
            return false;
        }
        if(currentFile == "" && currentDir == ""){
            log("No file or folder selected");
            return false;
        }
        var ext;
        if(isCurrentFile){
            if(currentFile.search(".") != -1 ){
                var filename = currentFile.substring(currentFile.lastIndexOf('/')+1);
                ext = filename.split('.').pop();
                filename = filename.substring(0, filename.lastIndexOf("."));
                if(filename != undefined){
                    $("#renameFileName1").val(filename);
                }
                if(ext != undefined){
                    $("#renameFileName2").val(ext);
                }
            }else{
                $("#renameFileName1").val(currentFile);
                $("#renameFileName2").val("");
            }
        }else{
            var dirname = currentDir.substr(0, currentDir.lastIndexOf("/"));
            $("#renameFolderName").val(dirname.substr(dirname.lastIndexOf('/')+1),dirname.length-1);
        }
        if(isCurrentFile){
            var currentThing= currentFile;
            var currentSelector = "#dialogRenameFile";
            var renameName = "Rename file";
            var renameAction = "file_rename.php";
            var currentNewName  = "#renameFileName1";
            
        }else{
            var currentThing= currentDir;
            var currentNewName  =  "#renameFolderName";
            var currentSelector = "#dialogRenameFolder";
            var renameName = "Rename folder";
            var renameAction = "folder_rename.php";
        }
        jQuery(function() {
            var dlg = jQuery(currentSelector).dialog({
                title: renameName,
                disabled: false,
                modal: true,
                buttons: {
                    "Cancel": function() {
                        $(this).dialog("close");
                    },
                    "Rename": function() {
                        if(isCurrentFile){
                            if($("#renameFileName2").val() != ""){
                                ext = "."  + $("#renameFileName2").val()
                            }else{
                                ext = "";
                            }
                        }else{
                            ext = "";
                        }
                        $(this).dialog("close");
                        log("renaming...");
                        $.post('browser/'+renameAction, {
                            "f":  currentThing,
                            "n":  $(currentNewName).val() + ext,
                            processData: false
                        }, function(data){
                            if(data != "{false}"){
                                reloadTree(currentDir);
                                log("renamed");
                            }else{
                                log("Error renaming");
                            }
                        });
                    }
                },
                resizable: false
            });
        });
        return false;
    });

    $("#new").click(function(){
        $("#newFileName1").val("");
        $("#newFileName2").val("");
        jQuery(function() {
            if(isCurrentFile){
                log("Please select a folder");
                return false;
            }
            if(currentDir != ""){
                var dirs = currentDir.split('/');
                var dir = "/"+dirs[dirs.length-2];
                createDir = currentDir;
            }else{
                dir = "/";
                createDir=docRoot;
            }
            $("#newFileCurrentDir").html("in: "+dir);
            var dlg = jQuery("#dialogNew").dialog({
                title: "New file",
                disabled: false,
                modal: true,
                buttons: {
                    "Cancel": function() {
                        $(this).dialog("close");
                    },
                    "Create": function() {
                        $(this).dialog("close");
                        log("creating...");
                        $.post('browser/file_create.php', {
                            "f":  createDir + "/" + $("#newFileName1").val()+"."+$("#newFileName2").val(),
                            processData: false
                        }, function(data){
                            if(data != "{false}"){
                                reloadTree(currentDir);
                                log("created");
                            }else{
                                log("Error creating");
                            }
                        });
                    }
                },
                resizable: false
            });
        });
        return false;
    });
    $("#configMenu .theme").click(function(){
        currentTheme = $(this).html();
        localStorage["theme"] = currentTheme;
        for(i=1;i<=tabCont;i++){
            window['cm_'+i] .setOption("theme", currentTheme);
        }
    });
    $("body").click( function(e){
        if ( $(e.target).closest('#configMenu').length === 0 ) {
            $("#configMenu").slideUp();
        }
        
    });
    var menuShow = true;
    $('#hidePanel').click(function(){
        if(menuShow){
            $("#hidePanel img").attr("src","img/right.png");
            $('#leftContainer').css("overflow","hidden");
            $("#browser").hide();
            $("#rootFolder").hide();
        }else{
            $("#hidePanel img").attr("src","img/left.png");
            $('#hidePanel').attr("title", "Hide");
            $("#refresh").show();
            $("#rootFolder").show();
            $('#leftContainer').css("overflow","scroll");
            $("#browser").show();
        }
        menuShow = !menuShow;
        return false;
    });
    function reloadTree(currentOpenedDir){
        if(currentOpenedDir != docRoot ){
        //open in the last opened directory
        }
        currentDir = "";
        currentFile = "";
        $('#browser').fileTree({
            root: docRoot,
            script: 'browser/jqueryFileTree.php',
            multiFolder: true,
            folderEvent : "dblclick"
        }, function(res) {
            if(res.open){
                if(res.file == undefined){
                    currentDir = res.folder;
                    //var dirs = currentDir.split('/');
                    //var dir = "/"+dirs[dirs.length-2];
                    //currentDir = dir;
                    isCurrentFile = false;
                }else{
                    currentFile = res.file;
                    isCurrentFile = true;
                    openFile(res.file);
                }
            }else{
                if(res.file != undefined){ //click on a file
                    currentFile= res.file;
                    isCurrentFile = true;
                }else{//click on a folder
                    currentDir = res.folder;
                    isCurrentFile = false;
                }
            }
            updateUpload();
        });
    }
    reloadTree();
    
    $("#config").mouseover(function(){
        $("#hide").slideDown(200);
    });
    $("#codeContainer").mouseover(function(){
        $("#hide").slideUp(200);
    });
    function switch_tabs(obj, number){
        currentTab = number;
        currentTabName = obj.attr("id");
        $('.tab-content').hide();
        $('.tabs a').removeClass("selected");
        var id = obj.attr("rel");
        $('#'+id).show();
        obj.addClass("selected");
        return false;
    }
    function switch_tabs_id(tabFileName){
        //currentTab = number;
        $('.tab-content').hide();
        $('.tabs a').removeClass("selected");
        var id = $(tabFileName).attr("rel");
        currentTabName = $(tabFileName).attr("id");
        $('#'+id).show();
        $(tabFileName).addClass("selected");
        return false;
    }
    function switch_tab_any(){
        //currentTab = number;
        $('.tab-content').hide();
        $('.tabs a').removeClass("selected");
        var id = $(".aTab:first").attr("rel");
        currentTabName = id;
        $('#'+id).show();
        $(".aTab:first").addClass("selected");
        return false;
    }
    function openFile(file) {
        var filename = file.replace(/^.*[\\\/]/, '');
        var fileId = file.replace(/\./g, "_").replace(/\//g,"-");
        if($("#"+fileId).length != 0){
            switch_tabs_id("#"+fileId)
            return false;
        }
        log("opening...");
        $.ajax({
            url: "browser/file_get.php?f="+file,
            context: document.body,
            cache: false
        }).done(function(data) {
            if(data != "{false}"){
                currentTabName = fileId;
                tabCont++
                currentTab = tabCont;
                files[tabCont] = file;
                tabSaved[currentTab] = true;
                document.title = "IDE - "+filename;
                $("a.selected").removeClass("selected");
                $(".tabs").append("<li><a href='#' id='"+fileId+"' class='selected aTab' rel='tabs"+tabCont+"'>"+filename+"</a><a href='#' rel='tabs"+tabCont+"' class='close'> </a></li>");
                $("#wrapper").append("<div class='tab-content' id='tabs"+tabCont+"'><div id='codeContainer'><form><textarea id='code"+tabCont+"' name='code"+tabCont+"'></textarea></form></div>");
                $('.close').click(function(){
                    var id = $(this).attr("rel");
                    var closer = $(this);
                    if(!$("a.selected.aTab").hasClass("nonSaved")){
                        $("#"+id).remove();
                        $(this).parent("li").remove();
                        if($(".aTab").length != 0){
                            switch_tab_any();
                        }else{
                            document.title = "IDE";
                        }
                    }else{
                        $("#dialogYesNo").html("Exit without saving?");
                        var dlg = jQuery("#dialogYesNo").dialog({
                            title: "Confirm",
                            disabled: false,
                            modal: true,
                            buttons: {
                                "Cancel": function() {
                                    $(this).dialog("close");
                                },
                                "Close": function() {
                                    $(this).dialog("close");
                                    $("#"+id).remove();
                                    closer.parent("li").remove();
                                    if($(".aTab").length != 0){
                                        switch_tab_any();
                                    }
                                }
                            },
                            resizable: false
                        });
                    }
                    return false;
                });
                $('.tab-content').not("#tabs"+tabCont).hide();
                $('.tabs a:not(.close)').click(function(){
                    switch_tabs($(this), $(this).attr("id"));
                    return false;
                });
                createNewCM(fileId, document.getElementById("code"+tabCont),data, filename);
                files[currentTabName] = file;
                currentFile = file;
                $(window).resize();
                log("opened");
            }else{
                log("Invalid extension");
            }
        });
        return false;
    }
    function createNewCM(filePath,myTextArea,data, fileName) {
        var ext = fileName.split('.').pop();
        var mode = "application/x-httpd-php";
        if(ext == "css"){
            mode = "text/css";
        }
        if(ext == "html" || ext == "htm"){
            mode = "application/x-httpd-php";
        }
        if(ext == "js" || ext == "json"){
            mode = "javascript";
        }
        window['cm_'+filePath] = CodeMirror.fromTextArea(myTextArea, {
            lineNumbers: true,
            matchBrackets: true,
            mode: mode,
            indentUnit: 2,
            indentWithTabs: true,
            enterMode: "keep",
            tabMode: "shift",
            lineWrapping: wrap,
            theme:currentTheme,
            onCursorActivity: function() {
                window['cm_name_'+currentTabName] = fileName;
                if(window['cm_'+currentTabName] != undefined){
                    window['cm_'+currentTabName].matchHighlight("CodeMirror-matchhighlight");
                }
            },
            onChange: function(){
                if(window['cm_name_'+currentTabName] != undefined){
                    $("a.selected.aTab").html(window['cm_name_'+currentTabName] + "*");
                    $("a.selected.aTab").addClass("nonSaved");
                    tabSaved[fileName] = false;
                    if(autoSave && !saving){
                        save();
                    }
                }
            }
        });
        
        window['cm_'+tabCont] = window['cm_'+currentTabName];
        window['cm_'+currentTabName].setValue(data);
        window['cm_'+currentTabName].clearHistory();
        $("a.selected.aTab").removeClass("nonSaved");
        $("a.selected.aTab").html(window['cm_name_'+currentTabName]);
        return false;
    }
    function log(msg){
        $("#msg").stop(true, true).fadeIn(500);
        $("#msg").html(msg);
        $("#msg").delay(1000).fadeOut(2000, function(){
            });
    }
    function save(){
		if(!$("a.selected.aTab").hasClass("nonSaved")){
            return false;
        }
        if($("a.selected.aTab").length == 0){
            log("No file to save");
            return false;
        }
        if(saving){
            tryToSave = true;
            return false;
        }
        saving = true;
        log("saving...");
        if(window['cm_'+currentTabName] != undefined){
            $.post('browser/file_save.php', {
                "c":  window['cm_'+currentTabName].getValue().replace(/\\/g,"\\\\"),
                processData: false,
                "f": files[currentTabName]
            }, function(data){
                if(data != "{false}"){
                    $("a.selected.aTab").html(window['cm_name_'+currentTabName]);
                    $("a.selected.aTab").removeClass("nonSaved")
                    tabSaved[currentTabName] = true;
                    log("saved");
                }else{
                    log("Error saving");
                }
                saving = false;
                if(tryToSave){
                    save();
                }
                tryToSave = false;
                return false;
            });
            return false;
        }
        return false;
    }
    $('#save').click(function(){
        save();
        return false;
    });
    $("#format").click(function(){
        format();
        return false;
    });

    function getSelectedRange() {
        return {
            from: window['cm_'+currentTabName].getCursor(true),
            to: window['cm_'+currentTabName].getCursor(false)
        };
    }
    function format() {
        if(window['cm_'+currentTabName] != undefined){
            var range = getSelectedRange();
            window['cm_'+currentTabName].autoFormatRange(range.from, range.to);
        } 
    }
    function commentSelection(isComment) {
        var range = getSelectedRange();
        editor.commentRange(isComment, range.from, range.to);
    }
    $(window).resize(function(){
        $('#leftContainer').css("height",$(window).height()-60);
        $('.CodeMirror-scroll').css("height",$(window).height()-80);
        $('#rightContainer').css("height",$(window).height()-80);
    });
    $(window).resize();

    function updateUpload(){
        var htmlUpload = "";
        var uploadButton = $('#upload');
        if(currentDir == ""){
            dir = docRoot;
        }else{
            dir = currentDir;
        }
        if(uploadButton.length > 0){
            new AjaxUpload(uploadButton,  {
                action: 'upload/upload-handler.php',
                name: 'userfile',
                data: {
                    path: dir
                },
                onSubmit : function(file, ext){
                    htmlUpload = $('#upload').html();
                    $('#upload').html("<span id='uploading'></span>uploading");
                    this.disable();
                },
                onComplete: function(file, response){
                    $('#upload').html(htmlUpload);
                    reloadTree();
                    this.enable();
                }
            });
        }
    }
});

function _basename(path) {
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
}

function _dirname(path) {
    return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');;
}