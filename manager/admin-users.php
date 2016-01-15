<?
$page_title = "Admin | Users";
$page_caption = "User Management";
$page_slug = basename(__FILE__, '.php');
include 'header.php';

// GET DECLARATIONS
$get_delete = isset($_GET['delete']) ? $_GET['delete'] : '';
$get_id = isset($_GET['id']) ? $_GET['id'] : '';
$get_edit = isset($_GET['edit']) ? $_GET['edit'] : '';
$get_send_activation = isset($_GET['send_activation']) ? $_GET['send_activation'] : '';
// POST SUBMITS
$post_add = isset($_POST['add']) ? $_POST['add'] : '';
$post_edit = isset($_POST['edit']) ? $_POST['edit'] : '';
// POST FIELDS
$post_id = isset($_POST['id']) ? $_POST['id'] : '';
$post_first_name = isset($_POST['first_name']) ? $_POST['first_name'] : '';
$post_last_name = isset($_POST['last_name']) ? $_POST['last_name'] : '';
$post_email = isset($_POST['email']) ? $_POST['email'] : '';
$post_regions_default_type = isset($_POST['regions_default_type']) ? $_POST['regions_default_type'] : '';

$post_active = isset($_POST['active']) ? $_POST['active'] : '';

$post_activation_status = isset($_POST['activation_status']) ? $_POST['activation_status'] : '';
$post_activation_code = isset($_POST['activation_code']) ? $_POST['activation_code'] : '';

$post_password = isset($_POST['password']) ? $_POST['password'] : '';
$post_organization = isset($_POST['organization']) ? $_POST['organization'] : '';
$post_organization_type = isset($_POST['organization_type']) ? $_POST['organization_type'] : '';
$post_access_level = isset($_POST['access_level']) ? $_POST['access_level'] : '';
// POST SEARCH
$post_keyword = isset($_POST['keyword']) ? $_POST['keyword'] : '';

if ($get_delete > 0) {
    $sql = "DELETE FROM users WHERE user_id = '$get_delete'";
    $result = mysqli_query($con,$sql);
    if (!$result) {
        die("QUERY FAILED");
    } else {
        $notification = inlineAlert("success", "User Removed Successfully", "The user you have chosen to remove has been removed", 0);
    }
}
if ($post_add == 1) {
    if (!$_POST['email'])
    {
        $notification = inlineAlert("danger", "Missing E-Mail", "You must enter a valid email", 0);
    }
    else
    {
        $md5_password = md5($post_password);
        $activation_code = strtoupper(generatePassword(25,4));
        $sql = "INSERT INTO users SET
                user_password = '$md5_password',
                user_first_name = '$post_first_name',
                user_last_name = '$post_last_name',
                user_email = '$post_email',
                user_active = '$post_active',
                user_activation_code = '$activation_code',
                user_activation_status = '$post_activation_status',
                user_organization = '$post_organization',
                user_organization_type = '$post_organization_type',
                user_regions_default_type = '$post_regions_default_type',
                user_access_level = '$post_access_level'";
        $result = mysqli_query($con, $sql);
        if (!$result) {
            die("QUERY FAILED, NOT ADDED" . mysqli_error($con));
        } else {
            $notification = inlineAlert("success", "User Created", "User has been created", 0);
        }
    }
}

if ($post_edit == 1) {
    if (!$post_email)
    {
        $notification = inlineAlert("danger", "Missing E-Mail", "You must enter a valid email", 0);
    }
    else
    {
        if ($post_password) {
            $md5_password = md5($post_password);
            $password_query = "user_password = '$md5_password',";
        } else { $password_query = ''; }
        $sql = "UPDATE users set
                user_first_name = '$post_first_name',
                user_last_name = '$post_last_name',
                user_email = '$post_email',
                ".$password_query."
                user_organization = '$post_organization',
                user_active = '$post_active',
                user_activation_code = '$post_activation_code',
                user_activation_status = '$post_activation_status',
                user_organization_type = '$post_organization_type',
                user_regions_default_type = '$post_regions_default_type',
                user_access_level = '$post_access_level'
                where user_id = '$post_id'";
        $result = mysqli_query($con, $sql);
        if (!$result) {
            die("QUERY FAILED, NOT ADDED" . mysqli_error($con));
        } else {
            $notification = inlineAlert("success", "$post_first_name $post_last_name Updated", "The user record has been updated", 0);
        }
    }
}



if ($get_edit > 0 && $post_edit != 1) {
    $edit_row = get_one_row($con,"SELECT * from users where user_id = '$get_edit'");
    $post_first_name = $edit_row['user_first_name'];
    $post_last_name = $edit_row['user_last_name'];
    $post_email = $edit_row['user_email'];
    $post_active = $edit_row['user_active'];
    $post_organization = $edit_row['user_organization'];
    $post_organization_type = $edit_row['user_organization_type'];
    $post_activation_code = $edit_row['user_activation_code'];
    $post_activation_status = $edit_row['user_activation_status'];
    $post_activation_date = $edit_row['user_activation_date'];
    $post_access_level = $edit_row['user_access_level'];
    $post_regions_default_type = $edit_row['user_regions_default_type'];
}

?>
    <div class="row">
        <div class="col-lg-12">
            <div class="col-lg-4">

                <section class="panel">
                    <header class="panel-heading">
                        <div class="panel-actions">
                            <a href="#" class="panel-action panel-action-toggle" data-panel-toggle=""></a>
                        </div>
                        <h2 class="panel-title"><? if ($get_edit > 0) echo "Edit"; else echo "Add"; ?> user</h2>
                    </header>
                    <div class="panel-body">
                        <form action="<?= $page_slug ?><? if ($get_edit > 0) echo "?edit=".$get_edit; ?>" method="POST" style="margin:0px" name=myform class="form-horizontal">

                            <? if ($get_edit > 0) { ?>
                                <input type="hidden" name=id value="<?=$get_edit?>">
                            <? } ?>

                            <div class="form-group">
                                <label class="col-md-3 control-label">Active?</label>
                                <div class="col-md-4">
                                    <div class="switch switch-primary">
                                        <input type="checkbox" name="active" value="1" data-plugin-ios-switch <? if ($post_active == 1) { echo " checked"; } ?>>
                                    </div>
                                </div>
                            </div>


                            <div class="form-group">
                                <label class="col-lg-3 control-label" for="first_name">First Name</label>
                                <div class="col-lg-9">
                                    <input type="text" class="form-control" id="first_name" placeholder="First Name" name="first_name" value="<?=$post_first_name?>" autofocus>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-lg-3 control-label" for="last_name">Last Name</label>
                                <div class="col-lg-9">
                                    <input type="text" class="form-control" id="last_name" placeholder="Last Name" name="last_name" value="<?= $post_last_name ?>" autofocus>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-lg-3 control-label" for="email">E-Mail</label>
                                <div class="col-lg-9">
                                    <input type="text" class="form-control" id="email" placeholder="E-Mail" name="email" value="<?= $post_email ?>" autofocus>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-lg-3 control-label" for="password">Password</label>
                                <div class="col-lg-9">
                                    <input type="password" class="form-control" id="password" placeholder="Password" name="password" value="<?= $post_password ?>" autofocus>
                                </div>
                            </div>


                            <div class="form-group">
                                <label class="col-lg-3 control-label" for="inputSuccess">Access Level</label>
                                <div class="col-lg-9">
                                    <select name="access_level" class="form-control">
                                        <option value="0"<? if ($post_access_level == 0 ) { echo " selected"; } ?>>Standard User</option>
                                        <option value="1"<? if ($post_access_level == 1 ) { echo " selected"; } ?>>Administrator</option>
                                    </select>
                                </div>
                            </div>



                            <div class="form-group">
                                <div class="col-md-offset-3 col-lg-9">
                                    <? if ($get_edit > 0) { ?>
                                        <button name="edit" value="1" onClick="form.submit();" class="btn btn-md btn-primary">Update User &raquo;</button>
                                        <a href="./admin-users" class="btn btn-md btn-default pull-right">Cancel</a>
                                    <? } else { ?>
                                        <button name="add" value="1" onClick="form.submit();" class="btn btn-md btn-primary">Add User &raquo;</button>
                                    <? } ?>
                                </div>
                            </div>

                        </form>
                    </div>
                </section>
            </div>


            <div class="col-lg-8">

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
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>E-Mail Address</th>
                            <th>Active?</th>
                            <th>Options</th>
                            </thead>
                            <tbody>
                            <?
                            if ($post_keyword) {
                                $keyword_query = "where user_first_name like '%$post_keyword%'";
                            } else {
                                $keyword_query = '';
                            }

                            $select = mysqli_query($con,"SELECT * FROM users ".$keyword_query." order by user_id DESC") or die(mysql_error());
                            while ($selectrow = mysqli_fetch_array($select, MYSQL_BOTH)) { ?>
                                <tr>
                                    <td><?= $selectrow['user_first_name'] ?></td>
                                    <td><?= $selectrow['user_last_name'] ?></td>
                                    <td><?= $selectrow['user_email'] ?></td>
                                    <td><? if($selectrow['user_active'] == 0) { echo "<span class=\"label label-danger\">Not Active</span>"; } else { echo "<span class=\"label label-success\">Active</span>"; } ?></td>
                                    <td>
                                        <a href="./admin-users?edit=<?=$selectrow['user_id']?>" class="btn btn-primary btn-xs">EDIT</a>
                                        <a href="./admin-users?delete=<?=$selectrow['user_id']?>" class="btn btn-danger btn-xs" onClick="return confirm('Are you sure?');">REMOVE</a>
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