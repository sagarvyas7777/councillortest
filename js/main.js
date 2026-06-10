
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const btn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (btn && nav) btn.addEventListener('click', () => nav.classList.toggle('open'));

  // Highlight current nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.style.color = 'var(--burgundy)';
  });


  // --- submission popup helper ---
    function createSubmissionPopup() {
    if (document.getElementById('submission-popup')) return;
    const overlay = document.createElement('div');
    overlay.id = 'submission-popup';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: 0,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)',
      zIndex: 9999,
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      background: '#fff',
      color: '#111',
      padding: '24px',
      width: 'min(520px, 94%)',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      textAlign: 'center',
      position: 'relative',
    });

    const close = document.createElement('button');
    close.type = 'button';
    close.innerText = '×';
    Object.assign(close.style, {
      position: 'absolute',
      right: '12px',
      top: '8px',
      border: 'none',
      background: 'transparent',
      fontSize: '20px',
      cursor: 'pointer'
    });

    const title = document.createElement('h2');
    title.innerText = 'Thanks — your submission was received';
    title.style.margin = '0 0 8px 0';

    const msg = document.createElement('p');
    msg.innerText = 'A campaign organizer will be in touch shortly.';
    msg.style.margin = '0 0 16px 0';

    const homeLink = document.createElement('a');
    homeLink.href = 'index.html';
    homeLink.innerText = 'Go to homepage';
    Object.assign(homeLink.style, {
      display: 'inline-block',
      padding: '10px 16px',
      background: 'var(--burgundy, #8b0000)',
      color: '#fff',
      borderRadius: '6px',
      textDecoration: 'none',
      marginTop: '6px'
    });

    box.appendChild(close);
    box.appendChild(title);
    box.appendChild(msg);
    box.appendChild(homeLink);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // store previous body styles so we can restore them
    let prevOverflow = '';
    let prevPaddingRight = '';
    const prevFilters = new Map();

    function hide() {
      overlay.style.display = 'none';
      // restore body scroll & padding
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      // restore filters on background elements
      for (const [el, val] of prevFilters.entries()) {
        el.style.filter = val.filter;
        el.style.transition = val.transition;
      }
      prevFilters.clear();
    }

    function show() {
      // save current values
      prevOverflow = document.body.style.overflow || '';
      prevPaddingRight = document.body.style.paddingRight || '';

      // lock scroll
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';

      // apply gentle blur to all background siblings (keep overlay sharp)
      Array.from(document.body.children).forEach((child) => {
        if (child === overlay) return;
        // save previous styles
        prevFilters.set(child, { filter: child.style.filter || '', transition: child.style.transition || '' });
        child.style.transition = 'filter 180ms ease';
        child.style.filter = 'blur(6px)';
      });


      overlay.style.display = 'flex';
    }

    close.addEventListener('click', hide);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) hide(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });

    // expose helpers
    createSubmissionPopup.show = show;
    createSubmissionPopup.hide = hide;
  }

  // ensure popup exists
  createSubmissionPopup();
  // --- end popup helper ---


  // Unified form handler — saves to localStorage and optionally posts (volunteer)
  document.querySelectorAll('form[data-storage]').forEach(form => {
    const storageKey = form.dataset.storage;
    const successEl = form.querySelector('.form-success');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      // clear errors
      form.querySelectorAll('.form-error').forEach(el => el.textContent = '');

      // validate required
      form.querySelectorAll('[required]').forEach(field => {
        const errEl = field.closest('.form-row')?.querySelector('.form-error');
        if (field.type === 'checkbox') {
          const group = form.querySelectorAll(`input[name="${field.name}"]:checked`);
          if (group.length === 0) { valid = false; if (errEl) errEl.textContent = 'Please choose at least one.'; }
        } else if (!field.value.trim()) {
          valid = false; if (errEl) errEl.textContent = 'This field is required.';
        } else if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(field.value)) {
          valid = false; if (errEl) errEl.textContent = 'Please enter a valid email.';
        }
      });

      if (!valid) return;

      // collect data object for localStorage
      const data = {};
      const fdForSave = new FormData(form);
      fdForSave.forEach((value, key) => {
        if (data[key] !== undefined) {
          data[key] = [].concat(data[key], value);
        } else { data[key] = value; }
      });
      data._submittedAt = new Date().toISOString();

      // If this form should be sent to an external endpoint (volunteer), post first
      if ((form.id === 'volunteer-form' || form.id === 'lawn-form' || form.id === 'contact-form') && form.action) {
        try {
          // create a fresh FormData snapshot to send
          const fd = new FormData(form);
          const res = await fetch(form.action, {
            method: form.method || 'POST',
            headers: { Accept: 'application/json' },
            body: fd,
          });
          const json = await res.json().catch(() => ({}));
          console.log('Form submission response:', json);
          if (!res.ok) {
            alert(json.message || 'Submission failed. Please try again.');
            return;
          }
        } catch (err) {
          alert('Network error — try again later.');
          return;
        }
      }

      // save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existing.push(data);
        localStorage.setItem(storageKey, JSON.stringify(existing));
      } catch (err) {
        // non-fatal — continue
        console.error('Failed to save submission locally', err);
      }

      // success UI
      form.reset();
      if (successEl) {
        successEl.classList.add('show');
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => successEl.classList.remove('show'), 6000);
      }
      // show popup with link to homepage
      if (createSubmissionPopup?.show) createSubmissionPopup.show();
    });
  });
});
