<?
$page_title = "Admin | Map Layers";
$page_caption = "Map Layer Management";
$page_slug = basename(__FILE__, '.php');
include 'header.php';
global $con;


// GET DECLARATIONS
$get_delete = isset($_GET['delete']) ? $_GET['delete'] : '';
$get_id = isset($_GET['id']) ? $_GET['id'] : '';
$get_edit = isset($_GET['edit']) ? $_GET['edit'] : '';

// POST SUBMITS
$post_add = isset($_POST['add']) ? $_POST['add'] : '';
$post_edit = isset($_POST['edit']) ? $_POST['edit'] : '';

// POST FIELDS
$post_id = isset($_POST['id']) ? $_POST['id'] : '';
$post_title = isset($_POST['title']) ? $_POST['title'] : '';
$post_active = isset($_POST['active']) ? $_POST['active'] : '';
$post_type = isset($_POST['type']) ? $_POST['type'] : '';
$post_source_type = isset($_POST['source_type']) ? $_POST['source_type'] : '';
$post_source_url = isset($_POST['source_url']) ? $_POST['source_url'] : '';
$post_source_params = isset($_POST['source_params']) ? $_POST['source_params'] : '';
$post_source_server_type = isset($_POST['source_server_type']) ? $_POST['source_server_type'] : '';
$post_visible = isset($_POST['visible']) ? $_POST['visible'] : '';

// POST SEARCH
$post_keyword = isset($_POST['keyword']) ? $_POST['keyword'] : '';

if ($get_delete > 0) {
    $sql = "DELETE FROM layers WHERE layer_id = '$get_delete'";
    $sql = "DELETE FROM layers WHERE layer_id = '$get_delete'";
    $result = mysqli_query($con,$sql);
    if (!$result) {
        die("QUERY FAILED");
    } else {
        $notification = inlineAlert("success", "Map Layer Removed Successfully", "The Map Layer you have chosen to remove has been removed", 0);
    }
}
if ($post_add == 1) {
    if (!$post_title)
    {
        $notification = inlineAlert("danger", "Missing Title", "You must enter a Title", 0);
    }
    else
    {
        $post_source_params = htmlspecialchars($post_source_params, ENT_QUOTES);
        $sql = "INSERT INTO layers SET
                layer_title = '$post_title',
                layer_active = '$post_active',
                layer_type = '$post_type',
                layer_source_type = '$post_source_type',
                layer_source_url = '$post_source_url',
                layer_source_params = '$post_source_params',
                layer_source_server_type = '$post_source_server_type',
                layer_visible = '$post_visible'";
        $result = mysqli_query($con, $sql);
        if (!$result) {
            die("QUERY FAILED, NOT ADDED" . mysqli_error($con));
        } else {
            $notification = inlineAlert("success", "Layer Created", "Layer has been created", 0);
        }
    }
}

if ($post_edit == 1) {
    if (!$post_title)
    {
        $notification = inlineAlert("danger", "Missing Title", "You must enter a Title", 0);
    }
    else
    {
        $post_source_params = htmlspecialchars($post_source_params, ENT_QUOTES);
        $sql = "UPDATE layers set
                layer_title = '$post_title',
                layer_active = '$post_active',
                layer_type = '$post_type',
                layer_source_type = '$post_source_type',
                layer_source_url = '$post_source_url',
                layer_source_params = '$post_source_params',
                layer_source_server_type = '$post_source_server_type',
                layer_visible = '$post_visible'
                where layer_id = '$post_id'";
        $result = mysqli_query($con, $sql);
        if (!$result) {
            die("QUERY FAILED, NOT ADDED" . mysqli_error($con));
        } else {
            $notification = inlineAlert("success", "Layer Updated", "The layer record has been updated", 0);
        }
    }
}



if ($get_edit > 0 && $post_edit != 1) {
    $edit_row = get_one_row($con,"SELECT * from layers where layer_id = '$get_edit'");
    $post_title = $edit_row['layer_title'];
    $post_active = $edit_row['layer_active'];
    $post_type = $edit_row['layer_type'];
    $post_source_type = $edit_row['layer_source_type'];
    $post_source_url = $edit_row['layer_source_url'];
    $post_source_params = $edit_row['layer_source_params'];
    $post_source_server_type = $edit_row['layer_source_server_type'];
    $post_visible = $edit_row['layer_visible'];
}

?>



    <div class="row">
        <div class="col-lg-12">
            <div class="col-lg-8">

                <section class="panel">
                    <header class="panel-heading">
                        <div class="panel-actions">
                            <a href="#" class="panel-action panel-action-toggle" data-panel-toggle=""></a>
                        </div>
                        <h2 class="panel-title"><? if ($get_edit > 0) echo "Edit"; else echo "Add"; ?> Map Layer</h2>
                    </header>
                    <div class="panel-body">
                        <form action="<?= $page_slug ?><? if ($get_edit > 0) echo "?edit=".$get_edit; ?>" method="POST" style="margin:0" name=myform class="form-horizontal">

                            <? if ($get_edit > 0) { ?>
                                <input type="hidden" name=id value="<?=$get_edit?>">
                            <? } ?>

                            <div class="form-group">
                                <label class="col-lg-3 control-label" for="first_name">Layer Title</label>
                                <div class="col-lg-9">
                                    <input type="text" class="form-control" id="title" placeholder="Title of Layer" name="title" value="<?=$post_title?>" autofocus>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-md-3 control-label">Active?</label>
                                <div class="col-md-4">
                                    <div class="switch switch-primary">
                                        <input type="checkbox" name="active" value="1" data-plugin-ios-switch <? if ($post_active == 1 || !$post_active) { echo " checked"; } ?>>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-lg-3 control-label" for="last_name">Layer Type</label>
                                <div class="col-lg-9">
                                    <select name="type" class="form-control">
                                        <option value="TILE"<? if ($post_type == 'TILE' ) { echo " selected"; } ?>>TILE</option>
                                        <option value="IMAGE"<? if ($post_type == 'IMAGE' ) { echo " selected"; } ?>>IMAGE</option>
                                    </select>
                                </div>
                            </div>





                            <div class="form-group">
                                <label class="col-lg-3 control-label" for="last_name">Source Type</label>
                                <div class="col-lg-9">
                                    <select name="source_type" class="form-control">
                                        <option value="TileWMS"<? if ($post_source_type == 'TileWMS' ) { echo " selected"; } ?>>TileWMS</option>
                                        <option value="TileArcGISRest"<? if ($post_source_type == 'TileArcGISRest' ) { echo " selected"; } ?>>TileArcGISRest</option>
                                        <option value="MapQuest"<? if ($post_source_type == 'MapQuest' ) { echo " selected"; } ?>>MapQuest</option>
                                        <option value="ImageWMS"<? if ($post_source_type == 'ImageWMS' ) { echo " selected"; } ?>>ImageWMS</option>
                                        <option value="XYZ"<? if ($post_source_type == 'XYZ' ) { echo " selected"; } ?>>XYZ</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-lg-3 control-label" for="password">Source URL</label>
                                <div class="col-lg-9">
                                    <input type="text" class="form-control" id="source_url" placeholder="Souce Layer URL" name="source_url" value="<?= $post_source_url ?>" autofocus>
                                </div>
                            </div>



                            <div class="form-group">
                                <label class="col-lg-3 control-label" for="password">Source Parameters</label>
                                <div class="col-lg-9">

                        <textarea class="form-control" rows="10" name="source_params" id="source_params" name="code_js" data-plugin-codemirror data-plugin-options='{ "mode": "text/javascript" }'><?=$post_source_params?></textarea>
                                </div>
                            </div>



                            <div class="form-group">
                                <label class="col-md-3 control-label">Visible?</label>
                                <div class="col-md-4">
                                    <div class="switch switch-primary">
                                        <input type="checkbox" value="1" name="visible" value="true" data-plugin-ios-switch <? if ($post_visible == 1 || !$post_visible) { echo " checked"; } ?>>
                                    </div>
                                </div>
                            </div>


                            <div class="form-group">
                                <div class="col-md-offset-3 col-lg-9">
                                    <? if ($get_edit > 0) { ?>
                                        <button name="edit" value="1" onClick="form.submit();" class="btn btn-md btn-primary">Update Layer</button>
                                        <a href="./admin-layers" class="btn btn-md btn-default pull-right">Cancel</a>
                                    <? } else { ?>
                                        <button name="add" value="1" onClick="form.submit();" class="btn btn-md btn-primary">Add Layer</button>
                                    <? } ?>
                                </div>
                            </div>

                        </form>
                    </div>
                </section>
            </div>


            <div class="col-lg-4">

                <section class="panel">
                    <header class="panel-heading">
                        <h2 class="panel-title"><?=$page_caption?></h2>
                    </header>
                    <div class="panel-body">

                        <?= $notification ?>
                        <form action="./admin-users" method=POST class="form-vertical ">
                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="input-group">
                                        <input type=TEXT name="keyword" class="form-control" value="<?=$post_keyword?>">
                                    <span class="input-group-btn">
                                    <button type="submit" class="btn btn-primary">Filter</button>
                                    </span></div>
                                </div>
                            </div>
                        </form>

                        <hr class="invisible short">
                        <table class="table table-hover">
                            <thead>
                            <th>Title</th>
                            <th>Active?</th>
                            <th>Visible?</th>
                            <th>Options</th>
                            </thead>
                            <tbody>
                            <?
                            if ($post_keyword) {
                                $keyword_query = "where layer_title like '%$post_keyword%'";
                            } else {
                                $keyword_query = '';
                            }

                            $select = mysqli_query($con,"SELECT * FROM layers ".$keyword_query." order by layer_id DESC") or die(mysqli_error($con));
                            while ($selectrow = mysqli_fetch_array($select)) { ?>
                                <tr>
                                    <td><?= $selectrow['layer_title'] ?></td>
                                    <td><? if($selectrow['layer_active'] == 0) { echo "<span class=\"label label-danger\">Not Active</span>"; } else { echo "<span class=\"label label-success\">Active</span>"; } ?></td>
                                    <td><? if($selectrow['layer_visible'] == 0) { echo "<span class=\"label label-danger\">Not Visible</span>"; } else { echo "<span class=\"label label-success\">Visible</span>"; } ?></td>
                                    <td>
                                        <a href="./admin-layers?edit=<?=$selectrow['layer_id']?>" class="btn btn-primary btn-xs">EDIT</a>
                                        <a href="./admin-layers?delete=<?=$selectrow['layer_id']?>" class="btn btn-danger btn-xs" onClick="return confirm('Are you sure?');">REMOVE</a>
                                    </td>
                                </tr>

                            <? } ?>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    </div>
<? include 'footer.php'; ?>

<script>

    $(document).ready(function () {

        var placeholder = "'LAYERS': 'layer_name',\n'TILED': true";
        //var placeholder = "test";
        $('#source_params').attr('placeholder', placeholder);

        $('#source_params').focus(function(){
            if($(this).val() === placeholder){
                $(this).attr('value', '');
            }
        });

    });

</script>
