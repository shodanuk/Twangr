<?php
class Tweets extends Controller {

  function Tweets(){
    parent::Controller();
  }

  public function my_timeline() {
    if(!$this->session->userdata('username')){
      // User is not logged in, redirect back to homepage
      header('Location: '.base_url().'home');
    }

    $data = array(
      "bodyClass" => "logged-in my_timeline",
      "isLoggedIn" => true,
      "pageTitle" => "Your timeline - Twangr",
      "userName" => $this->session->userdata('username')
    );
    $this->load->view('timeline', $data);
  }

  public function logout() {
    log_message('debug', 'Started home->logout');
    $this->session->sess_destroy();
    header('Location: '.base_url().'home');
  }
}

/* End of file home.php */
/* Location: ./system/application/controllers/home.php */