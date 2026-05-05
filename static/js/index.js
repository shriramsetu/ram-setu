// Testimonial slider
let testiIndex = 0;
const testiCards = document.querySelectorAll('.testimonial-card');
const testiTrack = document.getElementById('testiTrack');

function scrollTesti(dir) {
    if (!testiCards.length || !testiTrack) return;
    testiIndex = (testiIndex + dir + testiCards.length) % testiCards.length;
    testiTrack.style.transform = `translateX(-${testiIndex * 100}%)`;
}

if (testiCards.length > 0) {
    setInterval(() => scrollTesti(1), 5000);
}

// FAQ toggle
function toggleFaq(el) {
    el.classList.toggle('open');
}

// Add to cart feedback
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', function () {
            const originalText = this.innerHTML;
            this.textContent = '✓ Added!';
            this.style.background = 'var(--gold)';
            this.style.color = 'var(--dark)';
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = '';
                this.style.color = '';
            }, 1800);
        });
    });

    // Newsletter feedback
    const subscribeBtn = document.querySelector('.btn-subscribe');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function () {
            const input = document.querySelector('.newsletter-form input');
            if (input && input.value) {
                const originalText = this.textContent;
                this.textContent = '✓ Subscribed!';
                input.value = '';
                setTimeout(() => this.textContent = originalText, 2500);
            }
        });
    }
});
