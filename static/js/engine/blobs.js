// =========================================
// AMBIENT PURPLE BLOBS
// =========================================

const blobs = [];

for (let i = 0; i < 3; i++) {

    blobs.push({

        x: Math.random() * window.innerWidth,

        y: Math.random() * window.innerHeight,

        radius: 180 + Math.random() * 120,

        dx: (Math.random() - 0.5) * 0.15,

        dy: (Math.random() - 0.5) * 0.15

    });

}

function drawBlobs() {

    blobs.forEach(blob => {

        blob.x += blob.dx;
        blob.y += blob.dy;

        if (blob.x < -blob.radius) blob.x = window.innerWidth + blob.radius;
        if (blob.x > window.innerWidth + blob.radius) blob.x = -blob.radius;

        if (blob.y < -blob.radius) blob.y = window.innerHeight + blob.radius;
        if (blob.y > window.innerHeight + blob.radius) blob.y = -blob.radius;

        const gradient = ctx.createRadialGradient(
            blob.x,
            blob.y,
            0,
            blob.x,
            blob.y,
            blob.radius
        );

        gradient.addColorStop(0, "rgba(124,92,255,0.10)");
        gradient.addColorStop(1, "rgba(124,92,255,0)");

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();

    });

}