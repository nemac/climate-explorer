<!DOCTYPE html>
<html>
<head>
    
    <link rel="stylesheet" href="jsoneditor.css"/>
    <link rel="icon" href="logo-small.png"/>

    <title>Flexi JSON Editor and Inspector</title>

    <style>
        body {
          padding: 0 70px;
        }
        #json {
          margin: 10px 10px 10px 32px;
          width: 50%;
          min-height: 70px;
        }
        h1 {
          font-family: Arial;
          color: #EBBC6E;
          text-align: center;
          text-shadow: 1px 1px 1px black;
          border-bottom: 1px solid gray;
          padding-bottom: 50px;
          width: 500px;
          margin: 20px auto;
        }
        h1 img {
          float: left;
        }
        h1 b {
          color: black;
          font-weight: normal;
          display: block;
          font-size: 12px;
          text-shadow: none;
        }

        #legend {
          display: inline;
          margin-left: 30px;
        }
        #legend h2 {
           display: inline;
           font-size: 18px;
           margin-right: 20px;
        }
        #legend a {
          color: white;
          margin-right: 20px;
        }
        #legend span {
          padding: 2px 4px;
          -webkit-border-radius: 5px;
          -moz-border-radius: 5px;
          border-radius: 5px;
          color: white;
          font-weight: bold;
          text-shadow: 1px 1px 1px black;
          background-color: black;
        }
        #legend .string  { background-color: #009408; }
        #legend .array   { background-color: #2D5B89; }
        #legend .object  { background-color: #E17000; }
        #legend .number  { background-color: #497B8D; }
        #legend .boolean { background-color: #B1C639; }
        #legend .null    { background-color: #B1C639; }

        #expander {
          cursor: pointer;
          margin-right: 20px;
        }

        #footer {
          font-size: 13px;
        }

        #rest {
          margin: 20px 0 20px 30px;
        }
        #rest label {
          font-weight: bold;
        }
        #rest-callback {
          width: 70px;
        }
        #rest-url {
          width: 700px;
        }
        label[for="json"] {
          margin-left: 30px;
          display: block;
        }
        #json-note {
          margin-left: 30px;
          font-size: 12px;
        }

        .addthis_toolbox {
          position: relative;
          top: -10px;
          margin-left: 30px;
        }

        #disqus_thread {
          margin-top: 50px;
          padding-top: 20px;
          padding-bottom: 20px;
          border-top: 1px solid gray;
          border-bottom: 1px solid gray;
        }

    </style>

</head>

<body>
    
    <div id="legend">
        <span id="expander">Expand all</span>
        <span class="array">array</span>
        <span class="object">object</span>
        <span class="string">string</span>
        <span class="number">number</span>
        <span class="boolean">boolean</span>
        <span class="null">null</span>
        <span>Remove item by deleting a property name.</span>
    </div>


    <pre id="path"></pre>
    <div id="editor" class="json-editor"></div>

    <label for="json">Or paste JSON directly here:</label>
    <p id="json-note">Note that you can edit your JSON directly in the textarea below.
        The JSON viewer will get updated when you leave the field.</p>
    <textarea id="json" style="white-space: pre;"></textarea><br/>

    <div id="jsontest"></div>

    <script>

        <?
            $jsonfile = file_get_contents('../../testing/config.json', true);
        ?>

        var json = <?=$jsonfile?>;


    </script>

    <script src="json2.js"></script>
    <script src="jquery.min.js"></script>
    <script src="jquery.jsoneditor.js"></script>
    <script src="jsoneditor.js"></script>
</body>
</html>
