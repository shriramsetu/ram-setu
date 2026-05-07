// Mobile menu toggle
function toggleMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    }
}

// Scroll reveal animation
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        reveals.forEach(r => observer.observe(r));
    }

    // Universal add-to-cart: intercept all forms posting to /cart/add
    document.querySelectorAll('form[action*="/cart/add"]').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type=submit]') || this.querySelector('button');
            const original = btn.innerHTML;
            btn.innerHTML = 'Adding...';
            btn.disabled = true;
            fetch(this.action, { method: 'POST', body: new FormData(this) })
                .then(r => r.json())
                .then(d => {
                    if (d.success) {
                        btn.innerHTML = '✓ Added!';
                        btn.style.background = '#25D366';
                        document.querySelectorAll('.cart-count').forEach(el => el.textContent = d.cart_count);
                        setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.disabled = false; }, 2000);
                    } else {
                        alert(d.message || 'Error adding to cart');
                        btn.innerHTML = original;
                        btn.disabled = false;
                    }
                })
                .catch(() => { btn.innerHTML = original; btn.disabled = false; });
        });
    });
});
