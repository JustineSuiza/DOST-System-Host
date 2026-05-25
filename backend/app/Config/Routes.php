<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
// $routes->get('/', 'Home::index');
$routes->resource('Proposals');
$routes->resource('Projects');
$routes->resource('Releases');
$routes->resource('CounterpartFund');
$routes->resource('SixPS');
$routes->resource('UploadFile');

$routes->get('GetImage/(:segment)', 'UploadFile::showImage/$1');
$routes->get('GetFile/(:segment)', 'UploadFile::showFile/$1');

$routes->options('(:any)', 'Preflight::options');

$routes->resource('Signup');
$routes->resource('Login');
$routes->post('login', 'Login::create');
$routes->post('Login', 'Login::create');
$routes->resource('CheckLoggedIn');
$routes->resource('Logout');
$routes->resource('Accounts');
$routes->resource('ForgotPassword');

$routes->resource('ArchiveProposals');
$routes->resource('ArchiveProjects');
$routes->resource('ArchiveReleases');
$routes->resource('ArchiveCounterpartFund');

$routes->post('sendEmail', 'EmailController::sendEmail');

$routes->post('checkEmail', 'EmailController::checkEmail');

$routes->post('resetPassword', 'EmailController::resetPassword');

$routes->post('upload', 'Upload::create');
$routes->resource('Upload');