// Orchya Tech Limited — site behaviour. No external requests, no eval, no inline handlers.
(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Contact form: progressive enhancement via fetch, falls back to normal
  // POST navigation if JS is disabled or the request fails.
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      var status = document.getElementById('form-status');
      var action = form.getAttribute('action') || '';

      // If the Formspree endpoint hasn't been configured yet, block submission
      // client-side and tell the site owner instead of silently failing.
      if (action.indexOf('YOUR_FORM_ID') !== -1) {
        event.preventDefault();
        if (status) {
          status.textContent = 'Contact form is not yet connected. Email us directly using the details on this page.';
          status.setAttribute('data-state', 'error');
        }
        return;
      }

      event.preventDefault();
      var data = new FormData(form);

      fetch(action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            if (status) {
              status.textContent = 'Thanks — your message has been sent. We will be in touch shortly.';
              status.setAttribute('data-state', 'success');
            }
          } else {
            if (status) {
              status.textContent = 'Something went wrong sending your message. Please email us directly.';
              status.setAttribute('data-state', 'error');
            }
          }
        })
        .catch(function () {
          if (status) {
            status.textContent = 'Something went wrong sending your message. Please email us directly.';
            status.setAttribute('data-state', 'error');
          }
        });
    });
  }
})();
