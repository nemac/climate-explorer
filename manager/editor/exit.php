<?php
session_start();  
session_destroy();
die('<script type="text/javascript">window.location="index.php"</script>');
?>

