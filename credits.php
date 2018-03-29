<?php
$lockdown = 1;
include_once('functions.php');

?>
<!doctype html>
<html>
<head>
    <title>Climate Explorer</title>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="/resources/css/ol3-popup.css">

    <link rel="stylesheet" href="/resources/css/sweetalert.css">

    <link rel="stylesheet" media="screen" href="/resources/css/screen.css">
    <link rel="stylesheet" media="screen" href="/resources/css/mods.css">

    <script type="text/javascript" src="/resources/js/jquery.min.js"></script>
    <script type="text/javascript" src="/resources/js/jquery-ui.min.js"></script>

    <?php

    $share_data['url'] = current_URL();
    $share_data['title'] = 'Credits';

    echo opengraph_output($share_data);

    ?>

</head>

<body id="page-credits" class="page-type-text">
<div class="cd-cover-layer"></div>
<?php include_once('template/header.php'); ?>

<div id="viewport">
    <div id="main-content-wrap">

        <?php include_once('template/share.php'); ?>

        <section id="standard-splash" class="page-splash">
            <div class="splash-text">
                <h1>Credits & Acknowledgments</h1>
            </div>
        </section>

        <section id="standard-body" class="page-text">

            <p>
                The U.S. Climate Resilience Toolkit and Climate Explorer are managed by NOAA's Climate Program Office, and hosted by NOAA's National Centers for Environmental Information (NCEI-Asheville). </p>
            <p>
                Development of this version of the Climate Explorer was directed and overseen by an interagency team of federal climate model experts, chaired by the U.S. Global Change Research Program. Federal agencies that partnered in this effort are the Environmental Protection Agency (EPA), NASA, NOAA, and the U.S. Geological Survey (team members identified below). </p>
            <p>
                Design and programming of the Climate Explorer were completed by HabitatSeven, FernLeaf Interactive, and the National Environmental Modeling and Analysis Center (NEMAC), at UNC-Asheville. </p>
            <p>
                Production and processing of the LOCA climate projection data was done through a collaborative effort supported by NCEI-Asheville, NEMAC, and the Northeast Regional Climate Center, at Cornell University. Jay Alder (USGS) designed the color palettes and plotted data ranges for the interactive maps, and created future minus present difference maps for the 'precipitation' and 'number of dry days' variables. </p>
            <p>
                Interagency Climate Projection Team Members </p>
            <ul>

                <li>Fred Lipschultz, Chair, contractor to U.S. Global Change Research Program
                <li>Jay Alder, U.S. Geological Survey
                <li>Forrest Melton, NASA Ames Research Center Cooperative for Research in Earth Science and Technology / California State University Monterey Bay
                <li>Phil Morefield, U.S. Environmental Protection Agency
                <li>Andrea Ray, NOAA Earth System Research Laboratory
                <li>Liqiang Sun, NOAA National Centers for Environmental Information
                <li>William Sweet, NOAA National Ocean Service</li>
            </ul>

            <h3>U.S. Climate Resilience Toolkit Program Management</h3>

            <ul>

                <li>David Herring, program manager, NOAA Climate Program Office
                <li>LuAnn Dahlman, managing editor, contractor to NOAA Climate Program Office
                <li>Ned Gardiner, public engagement manager, contractor to NOAA Climate Program Office
                <li>Larry Belcher, programmer, contractor to NOAA Climate Program Office</li>
            </ul>

            <h3>Design, Programming & Development</h3>

            <ul>

                <li>Jamie Herring, president & lead designer, HabitatSeven
                <li>Jordan Harding, chief technology officer, HabitatSeven
                <li>Brendan Heberton, application architect, HabitatSeven
                <li>Wesley Bowman, data developer, HabitatSeven
                <li>Aires Almeida, chief creative officer, HabitatSeven
                <li>Phil Evans, senior designer, HabitatSeven
                <li>James Fox, director & product manager, NEMAC
                <li>Ian Johnson, geospatial technician, NEMAC
                <li>Jeff Hicks, director & programmer, Fernleaf Interactive
                <li>Josh Wilson, programmer, Fernleaf Interactive</li>
            </ul>

            <h3>Thanks also to reviewers:</h3>

            <ul>

                <li>Daniel Cayan, climate modeler, Scripps Institution of Oceanography
                <li>Keith Dixon, climate modeler, NOAA Geophysical Fluid Dynamics Laboratory
                <li>Katherine Hayhoe, climate modeler, Texas Tech University
                <li>Ken Kunkel, climate modeler, NOAA National Centers for Environmental Information</li>
            </ul>

        </section>
    </div>
</div>

<?php include_once('template/footer.php'); ?>

<script src="/resources/js/cwg/climate-widget-graph.js"></script>
<script src="/resources/js/cwg/cwg.js"></script>

</body>
</html>
