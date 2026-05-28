(function(){
  const body=document.body;
  const fab=document.getElementById('mobileNavFab');
  const backdrop=document.getElementById('mobileNavBackdrop');
  const setToggle=(open)=>{ if(!fab) return; fab.setAttribute('aria-expanded', String(open)); fab.innerHTML = open ? '<span class="toggle-icon">×</span><span class="toggle-text">Close</span>' : '<span class="toggle-icon">☰</span><span class="toggle-text">Menu</span>'; };
  const close=()=>{body.classList.remove('mobile-menu-open'); setToggle(false);};
  const toggle=()=>{const open=body.classList.toggle('mobile-menu-open'); setToggle(open);};
  setToggle(false);
  if(fab) fab.addEventListener('click', toggle);
  if(backdrop) backdrop.addEventListener('click', close);
  document.querySelectorAll('.sidebar .nav a, .sidebar .mobile-logout-btn').forEach(el=>el.addEventListener('click',()=>{ if(window.innerWidth<=980) close(); }));
  window.addEventListener('resize',()=>{ if(window.innerWidth>980) close(); });
})();
