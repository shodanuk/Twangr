<?php
class Twitter extends Controller {

  function Twitter(){
    parent::Controller();
  }

  public function login() {
    $params = array(
      'consumer_key' => $this->config->item('consumer_key'),
      'consumer_secret' => $this->config->item('consumer_secret'),
      'oauth_token' => NULL,
      'oauth_token_secret' => NULL
      );

    $this->load->library('TwitterOAuth', $params);

    // Requesting authentication tokens, the parameter is the URL we will be redirected to
    $request_token = $this->twitteroauth->getRequestToken(base_url().'twitter/oauth');

    // Saving them into the session
    $sessData = array(
      'oauth_token' => $request_token['oauth_token'],
      'oauth_token_secret' => $request_token['oauth_token_secret']
      );

    $this->session->set_userdata($sessData);

    // If everything goes well..
    if($this->twitteroauth->http_code == 200){
        // Let's generate the URL and redirect
      $url = $this->twitteroauth->getAuthorizeURL($request_token['oauth_token']);
      header('Location: '. $url);
    } else {
     // Bad response code from Twitter
     $this->load->view('fail_whale');
    }
  }

  public function login2() {
    $params = array(
      'consumer_key' => $this->config->item('consumer_key'),
      'consumer_secret' => $this->config->item('consumer_secret'),
      'oauth_token' => NULL,
      'oauth_token_secret' => NULL
      );

    $this->load->library('TwitterOAuth', $params);

    // Requesting authentication tokens, the parameter is the URL we will be redirected to
    $request_token = $this->twitteroauth->getRequestToken();

    // If everything goes well..
    if($this->twitteroauth->http_code == 200){
      $return = array(
        'status' => 'success',
        'url' => $this->twitteroauth->getAuthorizeURL($request_token['oauth_token']),
        'oauth_token' => $request_token['oauth_token'],
        'oauth_token_secret' => $request_token['oauth_token_secret']
      );
    } else {
      // Bad response code from Twitter
      //$this->load->view('fail_whale');
      $return = array(
        'status' => 'fail',
        'errorCode' => '001',
        'errorMsg' => 'Bad response from Twitter'
      );
    }

    header('Content-type: application/json');
    echo json_encode($return);
  }

  public function oauth() {
    if($this->session->userdata('username')){
      // User is logged in, redirect
      header('Location: '.base_url().'home');
    }

    if($_GET['oauth_verifier'] && $this->session->userdata('oauth_token') && $this->session->userdata('oauth_token_secret')){
      // TwitterOAuth instance, with two new parameters we got in twitter_login.php
      $params = array(
        'consumer_key' => $this->config->item('consumer_key'),
        'consumer_secret' => $this->config->item('consumer_secret'),
        'oauth_token' => $this->session->userdata('oauth_token'),
        'oauth_token_secret' => $this->session->userdata('oauth_token_secret')
        );

      $this->load->library('TwitterOAuth', $params);

      // Let's request the access token
      $access_token = $this->twitteroauth->getAccessToken($_GET['oauth_verifier']);
      // Save it in a session var
      $this->session->set_userdata(array('access_token' => $access_token));
      // Let's get the user's info
      $user_info = $this->twitteroauth->get('account/verify_credentials');
      // Print user's info
      //print_r("<pre>".$user_info."</pre>");

      if(isset($user_info->error)){
          // Something's wrong, go back to square 1
          log_message('error', $user_info->error);
          header('Location: '.base_url().'twitter/login');
      } else {
          // Let's find the user in the database by its ID
          $where = array(
            'oauth_provider' => 'twitter',
            'oauth_uid' => $user_info->id
            );

          $query = $this->db->get_where('users', $where);

          // If not, let's add it to the database
          if($query->num_rows() == 0){
            $data = array(
              'oauth_provider' => 'twitter',
              'oauth_uid' => $user_info->id,
              'username' => $user_info->screen_name,
              'oauth_token' => $access_token['oauth_token'],
              'oauth_secret' => $access_token['oauth_token_secret'],
            );

            $this->db->insert('users', $array);

            $result = $data;
            $result['id'] = $this->db->insert_id();
          } else {
            // Update the tokens
            $data = array(
              'oauth_token' => $access_token['oauth_token'],
              'oauth_secret' => $access_token['oauth_token_secret'],
              );
            $this->db->where(array(
              'oauth_provider' => 'twitter',
              'oauth_uid' => $user_info->id,
              ));
            $this->db->update('users', $data);
            $result = $query->row();
          }

          $sessdata['id'] = $result->id;
          $sessdata['username'] = $result->username;
          $sessdata['oauth_uid'] = $result->oauth_uid;
          $sessdata['oauth_provider'] = $result->oauth_provider;
          $sessdata['oauth_token'] = $result->oauth_token;
          $sessdata['oauth_token_secret'] = $result->oauth_secret;

          $this->session->set_userdata($sessdata);

          header('Location: '.base_url().'tweets/my_timeline');
      }

    } else {
        // Something's missing, go back to square 1
        log_message('error', 'auth_verifier, auth_token or auth_token_secret missing');
        header('Location: '.base_url().'twitter/login');
    }
  }

  public function oauth2() {
    //if($this->session->userdata('username')){
      // User is logged in, redirect
      //header('Location: '.base_url().'home');
    //}

    if($_POST['oauth_verifier'] && $_POST['oauth_token'] && $_POST['oauth_token_secret']) {
      // TwitterOAuth instance, with two new parameters we got in twitter_login.php
      $params = array(
        'consumer_key' => $this->config->item('consumer_key'),
        'consumer_secret' => $this->config->item('consumer_secret'),
        'oauth_token' => $_POST['oauth_token'],
        'oauth_token_secret' => $_POST['oauth_token_secret']
        );

      $this->load->library('TwitterOAuth', $params);

      // Let's request the access token
      $access_token = $this->twitteroauth->getAccessToken($_POST['oauth_verifier']);
      // Save it in a session var
      $this->session->set_userdata(array('access_token' => $access_token));
      // Let's get the user's info
      $user_info = $this->twitteroauth->get('account/verify_credentials');
      // Print user's info
      //print_r("<pre>".$user_info."</pre>");

      if(isset($user_info->error)){
          // Something's wrong, go back to square 1
          log_message('error', $user_info->error);
          $return = array(
            'status' => 'fail',
            'errorCode' => '002',
            'errorMsg' => $user_info->error
          );
      } else {
          // Let's find the user in the database by its ID
          // $where = array(
          //   'oauth_provider' => 'twitter',
          //   'oauth_uid' => $user_info->id
          //   );
          //
          // $query = $this->db->get_where('users', $where);

          // If not, let's add it to the database
          // if($query->num_rows() == 0){
          //   $data = array(
          //     'oauth_provider' => 'twitter',
          //     'oauth_uid' => $user_info->id,
          //     'username' => $user_info->screen_name,
          //     'oauth_token' => $access_token['oauth_token'],
          //     'oauth_secret' => $access_token['oauth_token_secret'],
          //   );
          //
          //   $this->db->insert('users', $array);
          //
          //   $result = $data;
          //   $result['id'] = $this->db->insert_id();
          // } else {
          //   // Update the tokens
          //   $data = array(
          //     'oauth_token' => $access_token['oauth_token'],
          //     'oauth_secret' => $access_token['oauth_token_secret'],
          //     );
          //   $this->db->where(array(
          //     'oauth_provider' => 'twitter',
          //     'oauth_uid' => $user_info->id,
          //     ));
          //   $this->db->update('users', $data);
          //   $result = $query->row();
          // }

          // $sessdata['id'] = $result->id;
          // $sessdata['username'] = $result->username;
          // $sessdata['oauth_uid'] = $result->oauth_uid;
          // $sessdata['oauth_provider'] = $result->oauth_provider;
          // $sessdata['oauth_token'] = $result->oauth_token;
          // $sessdata['oauth_token_secret'] = $result->oauth_secret;

          //$this->session->set_userdata($sessdata);

          //header('Location: '.base_url().'tweets/my_timeline');

          $return = array(
            'status' => 'success',
            'userid' => $user_info->id,
            'username' => $user_info->screen_name,
            'oauth_token' => $access_token['oauth_token'],
            'oauth_token_secret' => $access_token['oauth_token_secret']
          );
      }

      header('Content-type: application/json');
      echo json_encode($return);

    } else {
      // Something's missing, go back to square 1
      log_message('error', 'auth_verifier, auth_token or auth_token_secret missing');
      header('Content-type: application/json');
      echo json_encode(array(
        'status' => 'fail',
        'errorCode' => '003',
        'errorMsg' => 'auth_verifier, auth_token or auth_token_secret missing'
      ));
    }
  }

  public function updateStatus(){
    header('Content-type: application/json');

    if(!$this->session->userdata('username')){
      // User is not logged in
      echo json_encode(array(
        'resultText' => "Please <a href='/twitter/login'>log in</a>."
      ));
    }

    $params = array(
      'consumer_key' => $this->config->item('consumer_key'),
      'consumer_secret' => $this->config->item('consumer_secret'),
      'oauth_token' => $this->session->userdata('oauth_token'),
      'oauth_token_secret' => $this->session->userdata('oauth_token_secret')
      );

    $this->load->library('TwitterOAuth', $params);
    $this->twitteroauth->post('statuses/update', array('status' => $this->input->post('status', TRUE)));

    echo json_encode(array(
      'resultText' => 'Tweet tweeted!'
    ));
  }

  public function getTweets($user=false) {
    if(!$this->session->userdata('username')){
      // User is not logged in, redirect
      header('Location: '.base_url().'home');
    }

    $params = array(
      'consumer_key' => $this->config->item('consumer_key'),
      'consumer_secret' => $this->config->item('consumer_secret'),
      'oauth_token' => $this->session->userdata('oauth_token'),
      'oauth_token_secret' => $this->session->userdata('oauth_token_secret')
      );

    $this->load->library('TwitterOAuth', $params);

    $options = array(
      'count' => 15,
      'include_entities' => true,
      );

    if($sinceId = $this->input->post('sinceId')){
      $options['since_id'] = $sinceId;
    }

    if(!$user){
      $statuses = $this->twitteroauth->get('statuses/home_timeline', $options);
    }else{
      $statuses = $this->twitteroauth->get('statuses/home_timeline', $options);
    }

    header('Content-type: application/json');
    echo json_encode($statuses);
  }
}
?>