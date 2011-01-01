<?php $this->load->view("partials/header"); ?>

    <section id="update">
      <form action="/twitter/updateStatus" id="update-form">
        <fieldset>
          <div class="input text">
            <label for="status-update">Got something on your mind? Out with it then!</label>
            <textarea name="statusUpdate" id="status-update"></textarea>
          </div>
          <div class="submit">
            <input type="submit" name="submit" id="submit" value="Tweet it!" />
          </div>
        </fieldset>
      </form>
    </section>

    <section id="timeline">
      <a href="#" id="update-timeline">Update now</a>
      <ol class="tweets"></ol>
    </section>

<?php $this->load->view("partials/userDetailsTemplate"); ?>
<?php $this->load->view("partials/footer"); ?>