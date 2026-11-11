// Keep demonstration enquiries on this replica; never submit to the original site's CRM.
document.addEventListener('submit', function (event) {
  if (!(event.target instanceof HTMLFormElement)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const form = event.target;
  let notice = form.querySelector('[data-replica-notice]');
  if (!notice) {
    notice = document.createElement('p');
    notice.dataset.replicaNotice = '';
    notice.setAttribute('role', 'status');
    notice.style.cssText = 'font:14px/1.5 sans-serif;margin-top:20px;';
    form.appendChild(notice);
  }
  notice.textContent = 'Preview only — your enquiry has not been sent. A receiving email or CRM needs to be connected.';
  form.querySelectorAll('[data-form-btn] [hover="text"]').forEach(el => el.textContent = 'Send request');
}, true);
