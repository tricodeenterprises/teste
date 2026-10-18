document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Toast helper
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // Buy buttons
  const buyButtons = document.querySelectorAll('.buy-btn');
  buyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const plan = this.getAttribute('data-plan');
      showToast(`Você selecionou o plano ${plan}. Em breve entraremos em contato!`);
    });
  });

  // Scroll reveal animation
  const revealTargets = document.querySelectorAll(
    '.feature, .plan, .features h2, .pricing h2'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(el => observer.observe(el));
  } else {
    // Fallback: show everything
    revealTargets.forEach(el => el.classList.add('visible'));
  }
});
