<?
$page_title = "Admin | Map Layer Groups";
$page_caption = "Map Layer Group Management";
$page_slug = basename(__FILE__, '.php');
include 'header.php';
global $con;
// GET DECLARATIONS
$get_delete = isset($_GET['delete']) ? $_GET['delete'] : '';
$get_id = isset($_GET['id']) ? $_GET['id'] : '';
$get_edit = isset($_GET['edit']) ? $_GET['edit'] : '';

// POST DECLARATIONS
$post_add = isset($_POST['add']) ? $_POST['add'] : '';
$post_edit = isset($_POST['edit']) ? $_POST['edit'] : '';

$post_lg_active = isset($_POST['lg_active']) ? $_POST['lg_active'] : '';
$post_lg_name = isset($_POST['lg_name']) ? $_POST['lg_name'] : '';
$post_lg_id = isset($_POST['lg_id']) ? $_POST['lg_id'] : '';
$post_lg_parent = isset($_POST['lg_parent']) ? $_POST['lg_parent'] : '';
$post_lg_layers = isset($_POST['lg_layers']) ? $_POST['lg_layers'] : '';

$post_type = isset($_POST['type']) ? $_POST['type'] : '';
$post_group = isset($_POST['group']) ? $_POST['group'] : '';


$post_keyword = isset($_POST['keyword']) ? $_POST['keyword'] : '';



if ($get_delete > 0) {
    $sql = "DELETE FROM layer_groups WHERE lg_id = '$get_delete'";
    $result = mysqli_query($con,$sql);
    if (!$result) {
        die("QUERY FAILED");
    } else {
        $notification = inlineAlert("success", "Removed Successfully", "The record you have chosen to remove has been removed", 0);
    }
}
if ($post_add) {
    if (!$post_lg_name) {
        $notification = inlineAlert("danger", "Missing Name", "You must enter a name!", 1);
    } else {
        if (!$post_lg_slug) {
            $post_lg_slug = slug($post_lg_name);
        }

        if (is_array($post_lg_layers)){
            $post_lg_layers = implode(',', $post_lg_layers);
        }
        $sql = "INSERT INTO layer_groups SET
                lg_name = '$post_lg_name',
                lg_parent = '$post_lg_parent',
                lg_layers = '$post_lg_layers',
                lg_active = '$post_lg_active'";
        $result = mysqli_query($con,$sql);
        if (!$result) {
            die("QUERY FAILED, NOT ADDED" . mysqli_error($con));
        } else {
            $notification = inlineAlert("success", "Created", "Record has been created", 0);
        }
    }
}

if ($post_edit) {
    if (!$post_lg_name) {
        $notification = inlineAlert("danger", "Missing Name", "You must enter a name!", 0);
    } else {

        if (is_array($post_lg_layers)){
            $post_lg_layers = implode(',', $post_lg_layers);
        }
        $sql = "UPDATE layer_groups SET
                lg_name = '$post_lg_name',
                lg_parent = '$post_lg_parent',
                lg_layers = '$post_lg_layers',
                lg_active = '$post_lg_active'
                where lg_id = '$post_lg_id'";
        //echo $sql;
        $result = mysqli_query($con,$sql);
        if (!$result) {
            die("QUERY FAILED, NOT ADDED" . mysqli_error($con));
        } else {
            $notification = inlineAlert("success", "Updated", "Record has been updated", 0);
        }
    }
}

if ($get_edit > 0 && $post_edit != 1) {
    $catrow = get_one_row($con,"SELECT * from layer_groups where lg_id = '$get_edit'");
    $post_lg_name = $catrow['lg_name'];
    $post_lg_parent = $catrow['lg_parent'];
    $post_lg_layers = $catrow['lg_layers'];
    $post_lg_active = $catrow['lg_active'];
}

?>

<link rel="stylesheet" type="text/css" href="asmselect/jquery.asmselect.css" />

    <div class="row">
    <div class="col-lg-12">
        <div class="col-lg-6">
            <section class="panel">
                <header class="panel-heading">
                    <h2 class="panel-title"><?=$page_caption?></h2>
                </header>
                <div class="panel-body">
                    <?= $notification ?>
                    <p class="lead"><? if ($get_edit > 0) echo "Edit"; else echo "Add"; ?> category <?=$post_add?></p>
                    <form action="./admin-layer-groups?edit=<?=$get_edit?>" method="POST" style="margin:0" name=myform class="form-horizontal">

                        <? if ($get_edit) { ?>
                            <input type="hidden" name=lg_id value="<?=$get_edit?>">
                        <? } ?>

                        <div class="form-group">
                            <label class="col-md-4 control-label" for="inputSuccess">Category Name</label>
                            <div class="col-md-8">
                                <input type="text" class="form-control" id="lg_name" placeholder="Category Name" name="lg_name" value="<?=$post_lg_name?>" autofocus>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="control-label col-md-4">Active?</label>
                            <div class="col-md-8">
                                <div class="switch switch-primary">
                                    <input type="checkbox" name="lg_active" value="1" data-plugin-ios-switch <? if ($post_lg_active == 1 || !$post_lg_active) { echo " checked"; } ?>/>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-md-4 control-label" for="inputSuccess">Parent Category</label>
                            <div class="col-md-8">
                                <select name="lg_parent" class="form-control">
                                    <option value="0"<? if ($post_lg_parent == 0) { echo " selected"; } ?>>Top Level</option>
                                    <?
                                    $select_lg_query = mysqli_query($con,"SELECT * FROM layer_groups where lg_parent = '0' and lg_id != '$get_edit' order by lg_name") or die(mysqli_error($con));
                                    while ($select_lg_row = mysqli_fetch_array($select_lg_query)) {
                                        if ($post_lg_parent == $select_lg_row['lg_id']) {
                                            echo "<option value=\"$select_lg_row[lg_id]\" selected>$select_lg_row[lg_name]</option>";
                                        } else {
                                            echo "<option value=\"$select_lg_row[lg_id]\">$select_lg_row[lg_name]</option>";
                                        }
                                    } ?>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-md-4 control-label">Layers to Attach</label>
                            <div class="col-md-8">
                                <ul id="changes"></ul>
                                <select name="lg_layers[]" id="select_layers" multiple="multiple" class="multiple form-control populate">

                                <?
                                $layers_array = explode(",",$post_lg_layers);

                                $select = mysqli_query($con,"SELECT * FROM layers order by layer_id DESC") or die(mysqli_error($con));
                                while ($selectrow = mysqli_fetch_array($select)) {
                                    if (in_array($selectrow['layer_id'], $layers_array)) {
                                        $selected = " selected";
                                    } else {
                                        $selected = "";
                                    }
                                    echo "<option value=".$selectrow['layer_id']."".$selected.">".$selectrow['layer_title']."</option>";
                                }
                                ?>

                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-offset-4 col-md-8">
                                <? if ($get_edit > 0) { ?>
                                    <button name="edit" value="1" onClick="form.submit();" class="btn btn-md btn-primary">Update Map Layer Group &raquo;</button>
                                <? } else { ?>
                                    <button name="add" value="1" onClick="form.submit();" class="btn btn-md btn-primary">Add Map Layer Group &raquo;</button>
                                <? } ?>
                            </div>
                        </div>

                    </form>
                </div>
            </section>

        </div>


        <div class="col-lg-6">

            <section class="panel">
                <header class="panel-heading">
                    <h2 class="panel-title"><?=$page_caption?></h2>
                </header>
                <div class="panel-body">
                    <form action="<?= $_SERVER['PHP_SELF'] ?>" method=POST class="form-vertical ">
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
                    <table class="table table-highlight table-bordered table-condensed">
                        <thead>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Active</th>
                        <th>Layers</th>
                        <th>Options</th>
                        </thead>
                        <tbody>
                        <?
                        if ($post_keyword) {
                            $top_level_keyword_query = "OR (lg_parent = '0' AND lg_name like '%$post_keyword%')";
                            $sub_level_keyword_query = "and lg_name like '%$post_keyword%'";
                        } else {
                            $top_level_keyword_query = null;
                            $sub_level_keyword_query = null;

                        }

                        $select = mysqli_query($con,"SELECT * FROM layer_groups where lg_parent = '0' $top_level_keyword_query order by lg_name") or die(mysqli_error($con));
                        while ($selectrow = mysqli_fetch_array($select)) {

                            if ($selectrow['lg_active'] == 0){
                                $lg_active = "No";
                            } else {
                                $lg_active = "Yes";
                            }




                            ?>
                            <tr>
                                <td><?= $selectrow['lg_id'] ?></td>
                                <td><strong><?= $selectrow['lg_name'] ?></strong></td>
                                <td><?=$lg_active?></td>
                                <td>&nbsp;</td>
                                <td>
                                    <a href="./admin-layer-groups?edit=<?= $selectrow['lg_id'] ?>" class="btn btn-primary btn-xs">EDIT</a>
                                    <a href="./admin-layer-groups?delete=<?= $selectrow['lg_id'] ?>" class="btn btn-danger btn-xs" onClick="return confirm('Are you sure?');">X</a>
                                </td>
                            </tr>

                            <?
                            $selectsub = mysqli_query($con,"SELECT * FROM layer_groups where lg_parent = '$selectrow[lg_id]' $sub_level_keyword_query order by lg_name") or die(mysqli_error($con));
                            $subresults = mysqli_num_rows($selectsub);
                            if ($subresults == 0 && $post_keyword)
                                echo "<tr><td colspan=4 style=\"color:red\">No results found for <strong>$post_keyword</strong></td></tr>";
                            while ($selectsubrow = mysqli_fetch_array($selectsub)) {
                                if ($selectsubrow['lg_active'] == 0){
                                    $lgs_active = "No";
                                } else {
                                    $lgs_active = "Yes";
                                }
                                if ($selectsubrow['lg_layers']){
                                    $existing_lg_layers = explode(",",$selectsubrow['lg_layers']);
                                    if (is_array($existing_lg_layers)){
                                        $lg_layers = count($existing_lg_layers);
                                    }
                                } else {
                                    $lg_layers = "0";
                                }
                                ?>
                                <tr>
                                    <td><?= $selectsubrow['lg_id'] ?></td>
                                    <td>=== <?= $selectsubrow['lg_name'] ?></td>
                                    <td><?= $lgs_active ?></td>
                                    <td><?=$lg_layers?> Layers (<?=$selectsubrow['lg_layers']?>)</td>
                                    <td>
                                        <a href="./admin-layer-groups?edit=<?= $selectsubrow['lg_id'] ?>" class="btn btn-primary btn-xs">EDIT</a>
                                        <a href="./admin-layer-groups?delete=<?= $selectsubrow['lg_id'] ?>" class="btn btn-danger btn-xs" onClick="return confirm('Are you sure?');">X</a>
                                    </td>
                                </tr>
                            <? }
                        } ?>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
<? include 'footer.php'; ?>


        <script>
            $(document).ready(function () {

                    // or disable some features
                    $("#select_layers").multiselect({sortable: true, searchable: true});


            });

        </script>

