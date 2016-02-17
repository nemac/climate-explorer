<? include 'config.php'; ?>
<!doctype html>
<html class="fixed">
<head>
    <!-- Basic -->
    <meta charset="UTF-8">

    <title><?=$page_title?></title>

    <!-- Mobile Metas -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>

    <!-- Web Fonts  -->
    <link href="http://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800|Shadows+Into+Light" rel="stylesheet" type="text/css">

    <!-- Vendor CSS -->
    <link rel="stylesheet" href="template/assets/vendor/bootstrap/css/bootstrap.css"/>

    <link rel="stylesheet" href="template/assets/vendor/font-awesome/css/font-awesome.css"/>
    <link rel="stylesheet" href="template/assets/vendor/magnific-popup/magnific-popup.css"/>
    <link rel="stylesheet" href="template/assets/vendor/bootstrap-datepicker/css/datepicker3.css"/>
    <link rel="stylesheet" href="template/assets/vendor/bootstrap-colorpicker/css/bootstrap-colorpicker.css" />

    <link rel="stylesheet" href="template/assets/vendor/select2/select2.css" />
    <link rel="stylesheet" href="template/assets/vendor/jquery-datatables-bs3/assets/css/datatables.css" />

    <!-- Theme CSS -->
    <link rel="stylesheet" href="template/assets/stylesheets/theme.css"/>
    <!-- Skin CSS -->
    <link rel="stylesheet" href="template/assets/stylesheets/skins/default.css"/>
    <!-- Theme Custom CSS -->
    <link rel="stylesheet" href="template/assets/stylesheets/theme-custom.css">
    <!-- Head Libs -->
    <script src="template/assets/vendor/modernizr/modernizr.js"></script>

    <!-- Specific Page Vendor CSS -->
    <link rel="stylesheet" href="template/assets/vendor/codemirror/lib/codemirror.css"/>
    <link rel="stylesheet" href="template/assets/vendor/codemirror/theme/monokai.css"/>



    <link type="text/css" rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.10/themes/ui-lightness/jquery-ui.css" />


    <script language="javascript" type="text/javascript">
        function resizeIframe(obj) {
            obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
        }
    </script>


    <link rel="stylesheet" href="multiselect/css/ui.multiselect.css"/>

</head>
<body>
<section class="body">

    <!-- start: header -->
    <header class="header">
        <div class="logo-container">
            <div class="portal_logo">
                <a href="./"><?=$setting_site_name?></a>
            </div>

            <div class="visible-xs toggle-sidebar-left" data-toggle-class="sidebar-left-opened" data-target="html" data-fire-event="sidebar-left-opened">
                <i class="fa fa-bars" aria-label="Toggle sidebar"></i>
            </div>
        </div>

        <!-- start: search & user box -->
        <div class="header-right">


            <span class="separator"></span>



            <div id="userbox" class="userbox">
                <a href="#" data-toggle="dropdown">
                    <figure class="profile-picture">
                        <img src="template/assets/images/!logged-user.jpg" alt="Joseph Doe" class="img-circle" data-lock-picture="template/assets/images/!logged-user.jpg"/>
                    </figure>
                    <div class="profile-info" data-lock-name="<?=$session_first_name?> <?=$session_last_name?>" data-lock-email="<?=$session_email?>">
                        <span class="name"><?=$session_first_name?> <?=$session_last_name?></span>
                        <span class="role">administrator</span>
                    </div>

                    <i class="fa custom-caret"></i>
                </a>

                <div class="dropdown-menu">
                    <ul class="list-unstyled">
                        <li class="divider"></li>
                        <li>
                            <a role="menuitem" tabindex="-1" href="./logout"><i class="fa fa-power-off"></i> Logout</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- end: search & user box -->
    </header>
    <!-- end: header -->

    <div class="inner-wrapper">
        <!-- start: sidebar -->
        <aside id="sidebar-left" class="sidebar-left">

            <div class="sidebar-header">
                <div class="sidebar-title">
                    Navigation
                </div>
                <div class="sidebar-toggle hidden-xs" data-toggle-class="sidebar-left-collapsed" data-target="html" data-fire-event="sidebar-left-toggle">
                    <i class="fa fa-bars" aria-label="Toggle sidebar"></i>
                </div>
            </div>

            <div class="nano">
                <div class="nano-content">
                    <nav id="menu" class="nav-main" role="navigation">
                        <ul class="nav nav-main">
                            <li>
                                <a href="./">
                                    <i class="fa fa-home" aria-hidden="true"></i>
                                    <span>Dashboard</span>
                                </a>
                            </li>
                            <li class="nav-parent nav-expanded nav-active">
                                <a>
                                    <i class="fa fa-copy" aria-hidden="true"></i>
                                    <span>Administration</span>
                                </a>
                                <ul class="nav nav-children">
                                    <li>
                                        <a href="./admin-users">
                                            Users
                                        </a>
                                        <a href="./admin-layers">
                                            Map Layers
                                        </a>
                                        <a href="./admin-json-config">
                                            Json Configuration
                                        </a>
                                        <a href="./admin-layer-groups">
                                            Map Layer Groups
                                        </a>
                                    <li class="nav-parent <? if ($setting_current_file_slug == 'admin-settings') { echo "nav-expanded"; } ?> ">
                                        <a>Settings</a>
                                        <ul class="nav nav-children" style="">
                                            <li>
                                                <a <? if ($setting_current_file_slug == 'admin-settings') { echo "data-toggle=\"collapse\""; } ?> aria-expanded="true" data-parent="#accordion" href="./admin-settings#general">General Settings</a>
                                            </li>
                                            <li>
                                                <a <? if ($setting_current_file_slug == 'admin-settings') { echo "data-toggle=\"collapse\""; } ?> aria-expanded="true" data-parent="#accordion" href="./admin-settings#colors">Color Settings</a>
                                            </li>
                                            <li>
                                                <a <? if ($setting_current_file_slug == 'admin-settings') { echo "data-toggle=\"collapse\""; } ?> aria-expanded="true" data-parent="#accordion" href="./admin-settings#database">Database Settings</a>
                                            </li>
                                            <li>
                                                <a <? if ($setting_current_file_slug == 'admin-settings') { echo "data-toggle=\"collapse\""; } ?> aria-expanded="true" data-parent="#accordion" href="./admin-settings#mail">Mail Settings</a>
                                            </li>
                                        </ul>
                                    </li>
                                    </li>
                                </ul>
                            </li>


                        </ul>
                    </nav>

                    <hr class="separator"/>



                </div>

            </div>

        </aside>
        <!-- end: sidebar -->

        <section role="main" class="content-body">
            <header class="page-header">
                <h2><?=$page_caption?></h2>

                <div class="right-wrapper pull-right">
                    <ol class="breadcrumbs">
                        <li>
                            <a href="./">
                                <i class="fa fa-home"></i>
                            </a>
                        </li>
                        <li><span>Administration</span></li>
                        <li><span><?=$page_caption?></span></li>
                    </ol>

                    <a class="sidebar-right-toggle" data-open="sidebar-right"><i class="fa fa-chevron-left"></i></a>
                </div>
            </header>

            <!-- start: page -->