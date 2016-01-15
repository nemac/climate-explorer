<?php
include("config.php");
session_start();
if (!isset($_SESSION["username"])) {
    die('<script type="text/javascript">"window.location=index.php"</script>');
}
?><!doctype html>
<html>
    <head>
        <title>IDE</title>
        <script src="js/jquery-1.7.2.min.js"></script>
        <script src="js/jquery-ui-1.8.21.custom.min.js"></script>
        <link rel="stylesheet" href="code/lib/codemirror.css">
        <script src="code/lib/codemirror.js"></script>
        <!--<script src="code/lib/util/formatting.js"></script>-->
        <script src="code/lib/util/searchcursor.js"></script>
        <script src="code/lib/util/formatting.js"></script>
        <script src="code/lib/util/search.js"></script>
        <script src="code/lib/util/searchcursor.js"></script>
        <script src="code/lib/util/dialog.js"></script>
        <link rel="stylesheet" href="code/lib/util/dialog.css">
        <script src="code/lib/util/match-highlighter.js"></script>
        <link rel="stylesheet" href="browser/jqueryFileTree.css">
        <script src="browser/jqueryFileTree.js"></script>
        <link rel="stylesheet" href="css/dark-drive/jquery-ui-1.8.21.custom.css">
        <link rel="stylesheet" href="code/theme/ambiance.css">
        <link rel="stylesheet" href="code/theme/neat.css">
        <link rel="stylesheet" href="code/theme/elegant.css">
        <link rel="stylesheet" href="code/theme/erlang-dark.css">
        <link rel="stylesheet" href="code/theme/night.css">
        <link rel="stylesheet" href="code/theme/monokai.css">
        <link rel="stylesheet" href="code/theme/cobalt.css">
        <link rel="stylesheet" href="code/theme/eclipse.css">
        <link rel="stylesheet" href="code/theme/rubyblue.css">
        <link rel="stylesheet" href="code/theme/lesser-dark.css">
        <link rel="stylesheet" href="code/theme/xq-dark.css">
        <link rel="stylesheet" href="code/theme/ambiance.css">
        <link rel="stylesheet" href="code/theme/blackboard.css">
        <link rel="stylesheet" href="code/theme/vibrant-ink.css">

        <link rel="stylesheet" href="css/style.css">
        <script src="code/mode/xml/xml.js"></script>
        <script src="code/mode/javascript/javascript.js"></script>
        <script src="code/mode/css/css.js"></script>
        <script src="code/mode/htmlembedded/htmlembedded.js"></script>
        <script src="code/mode/clike/clike.js"></script>
        <script src="code/mode/php/php.js"></script>
        <script type="text/javascript" src="upload/ajaxupload.js"></script>

        <?php
        echo "<script>var docRoot = '$folder';</script>";
        echo "<script>var currentTheme = '$defaultTheme';</script>";
        echo "<script>var autoSave = $autosave;</script>";
        echo "<script>var wrap = $wordwrap;</script>";
        ?>
        <script src="js/functions.js"></script>
        <style type="text/css">.CodeMirror {border-top: 1px solid black; border-bottom: 1px solid black;}</style>
    </head>
    <body>

        <div id="container">

            <div id="menu">
                <a title="Configuration" id="config" href="#"><img src="img/config.png"/></a>
                <div id="configMenu">
                    <div class="configMenu_separator">Options:</div>
                    <div id="autosave">autosave</div>
                    <div id="wrap" title="need to reload the file">word-wrap</div>
                    <div class="configMenu_separator">Themes:</div>
                    <div class="theme selected" id="ambiance">ambiance</div>
                    <div class="theme" id="default">default</div>
                    <div class="theme" id="blackboard">blackboard</div>
                    <div class="theme" id="cobalt">cobalt</div>
                    <div class="theme" id="elegant">elegant</div>
                    <div class="theme" id="eclipse">eclipse</div>
                    <div class="theme" id="erlang-dark">erlang-dark</div>
                    <div class="theme" id="lesser-dark">lesser-dark</div>
                    <div class="theme" id="neat">neat</div>
                    <div class="theme" id="monokai">monokai</div>
                    <div class="theme" id="night">night</div>
                    <div class="theme" id="rubyblue">rubyblue</div>
                    <div class="theme" id="vibrant-ink">vibrant-ink</div>
                    <div class="theme" id="xq-dark">xq-dark</div>
                </div>
                <a title="Hide" href="#" id="hidePanel" ><img src="img/left.png"/><span id="hideText">browser</span></a>
                <a title="Refresh tree" id="refresh" href="#"><img src="img/refresh.png"/>reload tree</a>
                <a title="Delete" id="delete" href="#" ><img src="img/delete.png"/>delete</a>
                <a title="Rename" id="rename" href="#" ><img src="img/rename.png"/>rename</a>
                <a title="New" id="new" href="#" ><img src="img/new.png"/>new</a><!--
                <a title="Upload" id="upload2" href="#"><img src="img/up.png"/>upload</a>-->
                <a title="Format selection" id="format" href="#"><img src="img/format.png"/>format</a>
                <a title="Save" id="save" href="#"><img src="img/save.png"/>save</a>
                <!--<a title="Save" id="upload" class="button" href="#"><img src="img/upload.png"/>upload</a>-->
<!--<span style="font-size: 0.8em; color:#0972a5;margin-left: 5px;">This is just a preview,
    it doesn't work! <a href="doc/" target="_blank">Documentation</a></span>-->
                <div style="float: right;">
                    <a title="Save" class="exitItem" id="exit" href="#"><img src="img/exit.png"/>exit</a>
                </div>
            </div>
            <div id="leftContainer" style="float: left;">
                <ul class="jqueryFileTree" id="rootFolder">
                    <li class="directory collapsed"><a id="root" href="#">..</a></li>
                </ul>
                <div id="browser" class="ui-widget-content">
                </div>
            </div>
            <div id="rightContainer">

                <div id="wrapper">
                    <ul class="tabs">
                    </ul>
                </div>
            </div>
        </div>
        <div id="msg"></div>
        <div id="dialogYesNo" style="text-align: left;display: none;"></div>
        <div id="dialogNew" style="text-align: left;display: none;">
            <p>
                <input name="newFileName1" id="newFileName1" type="text" size="8"/>.
                <input name="newFileName2" id="newFileName2" type="text" size="2"/>
                <br/>
                <br/>
                <span id="newFileCurrentDir"></span>
            </p>
        </div>
        <div id="dialogRenameFile" style="text-align: left;display: none;">
            <p>
                <input name="newFileName1" id="renameFileName1" type="text" size="12"/>.
                <input name="newFileName2" id="renameFileName2" type="text" size="2"/>
                <br/>
                <br/>
            </p>
        </div>
        <div id="dialogRenameFolder" style="text-align: left;display: none;">
            <p>
                <input name="newFolderName" id="renameFolderName" type="text"/>
                <br/>
                <br/>
            </p>
        </div>
    </body>
</html>