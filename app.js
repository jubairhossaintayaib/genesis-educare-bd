(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#main-nav');
  const closeMenu = () => { navigation?.classList.remove('is-open'); menuButton?.setAttribute('aria-expanded','false'); menuButton?.setAttribute('aria-label','Open navigation'); };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', open);
  });
  document.addEventListener('click', event => {
    document.querySelectorAll('.nav-group[open]').forEach(group => { if (!group.contains(event.target)) group.open = false; });
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.querySelectorAll('.nav-group').forEach(group => group.addEventListener('toggle', () => {
    if (group.open) document.querySelectorAll('.nav-group').forEach(other => { if(other !== group) other.open = false; });
  }));
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape') { closeMenu(); document.querySelectorAll('.nav-group[open]').forEach(group => group.open = false); }
  });
  matchMedia('(min-width: 1051px)').addEventListener('change', closeMenu);

  document.querySelectorAll('[data-filter-browser]').forEach(browser => {
    const cards = [...browser.querySelectorAll('[data-country]')];
    const buttons = [...browser.querySelectorAll('[data-filter]')];
    const search = browser.querySelector('[data-search-input]');
    const select = browser.querySelector('[data-country-select]');
    let filter = 'All';
    const update = () => {
      const query = (search?.value || '').trim().toLowerCase();
      let count = 0;
      cards.forEach(card => {
        const match = (filter === 'All' || (select ? card.dataset.country : card.dataset.region) === filter) && card.dataset.search.includes(query);
        card.hidden = !match;
        if(match) count++;
      });
      buttons.forEach(button => { const active = button.dataset.filter === filter; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
      browser.querySelector('.empty-state').hidden = count > 0;
      const noun = select ? 'university option' : 'destination';
      browser.querySelector('.filter-status').textContent = `${count} ${noun}${count === 1 ? '' : 's'} available`;
    };
    buttons.forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; update(); }));
    search?.addEventListener('input', update);
    select?.addEventListener('change', () => { filter = select.value; update(); });
    browser.querySelector('[data-reset]')?.addEventListener('click', () => { filter='All'; if(search) search.value=''; if(select) select.value='All'; update(); search?.focus(); });
    if(select){ const preferred = new URLSearchParams(location.search).get('destination'); if([...select.options].some(o=>o.value===preferred)){ select.value=preferred;filter=preferred; } }
    update();
  });

  const form = document.querySelector('#enquiry-form');
  if(form){
    const params = new URLSearchParams(location.search);
    ['destination','programme'].forEach(name => {
      const element = form.elements.namedItem(name);
      const value = params.get(name);
      if(value && [...element.options].some(option => option.value === value)) element.value = value;
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if(!form.reportValidity()) return;
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      if(!name){ form.elements.name.setCustomValidity('Please enter your name.'); form.elements.name.reportValidity(); return; }
      const destination = form.elements.destination.selectedOptions[0].text;
      const programme = form.elements.programme.selectedOptions[0].text;
      const lines = ['Hello Genesis Educare, I would like guidance for studying abroad.', '', `Name: ${name}`, `Phone: ${String(data.get('phone')).trim()}`, data.get('email') ? `Email: ${String(data.get('email')).trim()}` : '', `Destination: ${destination}`, `Study level: ${programme}`, data.get('message') ? `Message: ${String(data.get('message')).trim()}` : ''].filter(Boolean);
      const selectedNumber = String(data.get('adviser'));
      if(!/^880180548617[0-3]$/.test(selectedNumber)) return;
      const link = `https://wa.me/${selectedNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
      const fallback = document.querySelector('#whatsapp-fallback');
      fallback.href = link; fallback.hidden = false;
      document.querySelector('#form-status').textContent = 'Your message is prepared. Review it in WhatsApp and press send to contact our team.';
      window.open(link, '_blank', 'noopener,noreferrer');
    });
    form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));
  }

  const lightbox = document.querySelector('#image-lightbox');
  document.querySelectorAll('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    if(!lightbox?.showModal) { window.open(button.dataset.lightbox,'_blank','noopener,noreferrer'); return; }
    lightbox.querySelector('img').src = button.dataset.lightbox;
    lightbox.querySelector('img').alt = button.dataset.caption;
    lightbox.querySelector('p').textContent = button.dataset.caption;
    lightbox.showModal();
  }));
  lightbox?.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', event => { if(event.target===lightbox){ const rect=lightbox.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) lightbox.close(); } });

  document.querySelectorAll('[data-intake-deadline]').forEach(item => {
    if(Date.now() > new Date(item.dataset.intakeDeadline).getTime()){
      item.classList.add('expired');
      item.textContent='The advertised campaign deadline was 11 October 2026. Contact our team for current intake availability.';
    }
  });
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), {threshold:0.04});
    document.querySelectorAll('[data-reveal]').forEach(element => { element.classList.add('reveal-ready'); observer.observe(element); });
  }
})();
