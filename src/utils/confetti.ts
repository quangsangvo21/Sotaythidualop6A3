import confetti from 'canvas-confetti';

export function fireConfetti(durationMs = 2500) {
  try {
    const end = Date.now() + durationMs;
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Graceful fallback if canvas is not supported
  }
}

export function fireStars() {
  try {
    confetti({
      particleCount: 40,
      spread: 100,
      origin: { y: 0.6 },
      shapes: ['star', 'circle'],
      colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#F43F5E'],
    });
  } catch {
    // Fallback
  }
}
