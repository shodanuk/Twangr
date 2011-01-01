<?php
class Home extends Controller {

  function Home(){
    parent::Controller();
  }

  public function index(){
    if($this->session->userdata('username')){
      // User is not logged in, redirect
      header('Location: '.base_url().'tweets/my_timeline');
    }

    $data = array(
      "bodyClass" => "home",
      "isLoggedIn" => false,
      "pageTitle" => "Twangr - yet another Twitter client. Please log in."
    );

    $this->load->view('home', $data);
  }

  public function fail(){
    $data = array(
      "bodyClass" => "fail",
      "isLoggedIn" => false,
      "pageTitle" => "Teh fail :("
    );

    $this->load->view('fail_whale', $data);
  }
}

/* End of file home.php */
/* Location: ./system/application/controllers/home.php */