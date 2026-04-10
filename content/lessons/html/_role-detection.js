// AESDR Role Detection — injected into every lesson HTML
// Reads ?role= from URL and sets data-role on <html> element.
// CSS classes: .ae-only, .sdr-only, .ae-content, .sdr-content
(function(){
  var p = new URLSearchParams(window.location.search);
  var role = p.get('role') || 'sdr';
  document.documentElement.setAttribute('data-role', role);
})();
