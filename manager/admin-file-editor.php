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
            $notification = inlineAlert("success", "User Created", "User has been created", 0);
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
        <div class="col-lg-12">

            <section class="panel">
                <header class="panel-heading">
                    <div class="panel-actions">
                        <a href="#" class="panel-action panel-action-toggle" data-panel-toggle=""></a>
                    </div>
                    <h2 class="panel-title">config.json editor</h2>
                </header>
                <div class="panel-body">

                    <?php

                    // configuration
                    $url = 'admin-file-editor.php';
                    $file = '../config.json';

                    // check if form has been submitted
                    if (isset($_POST['text']))
                    {
                        // save the text contents
                        file_put_contents($file, $_POST['text']);

                        // redirect to form again
                        header(sprintf('Location: %s', $url));
                        printf('<a href="%s">Moved</a>.', htmlspecialchars($url));
                        exit();
                    }

                    // read the textfile
                    $text = file_get_contents($file);

                    ?>
                    <!-- HTML form -->
                    <form action="" method="post">
                        <textarea name="text"><?php echo htmlspecialchars($text) ?></textarea>
                        <input type="submit" />
                        <input type="reset" />
                    </form>


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
