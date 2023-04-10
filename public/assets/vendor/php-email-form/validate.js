/*
* PHP Email Form Validation - v3.2
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', async function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!')
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      if(!thisForm.name || !thisForm.email || !thisForm.subject || !thisForm.message || !thisForm.answer){
        displayError(thisForm, 'Please fill all the fields!')
        return;
      }
      let formData = new FormData( thisForm );
      
      const data = new URLSearchParams();
      for (const pair of formData.entries()) {
        data.append(pair[0], pair[1]);
      }
     /*
      const response = await fetch('/verifyCaptcha', {
        method: 'POST',
        body: data,
      })
      if(response.status == 200) php_email_form_submit(thisForm,action,data)
      else{
        displayError(thisForm, response.statusText);
        return
      }*/
      php_email_form_submit(thisForm,action,data)
    });
  });

  function php_email_form_submit(thisForm, action, data) {
    fetch(action, {
      method: 'POST',
      body: data
    })
    .then(response => {
      if( response.ok ) {
        return response.text()
      } else {
        throw new Error(`${response.status} ${response.statusText}`); 
      }
    })
    .then(data => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      if (data.trim() == 'OK') {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset(); 
      } else {
        throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action); 
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
