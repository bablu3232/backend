<?php
$_GET['user_id'] = 1;
include 'db.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);
include 'get_user_reports.php';
?>
