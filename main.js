// Typewriter Effect
function typeWriter(element, text, speed = 50) {
    element.innerHTML = "";
    let i = 0;
    function type() {
        if (i < text.length) {
            if (text.substring(i, i + 4) === "<br>") {
                element.innerHTML += "<br>";
                i += 4;
            } else {
                element.innerHTML += text.charAt(i);
                i++;
            }
            setTimeout(type, speed);
        }
    }
    type();
}

window.addEventListener('DOMContentLoaded', () => {
    const heroH1 = document.querySelector('.hero h1');
    const originalText = "Impresiones que desafían<br>los límites de la imaginación";
    setTimeout(() => { typeWriter(heroH1, originalText, 40); }, 800);
});

// ==========================================
// AGUA TORNASOL INTERACTIVA (Three.js Shader)
// ==========================================

const canvas = document.getElementById('fluid-canvas');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Shader Material para el efecto "Agua Tornasol"
const uniforms = {
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0, 0) },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    varying vec2 vUv;

    // Función para crear ruido/ondas
    float wave(vec2 p) {
        return sin(p.x * 10.0 + u_time) * cos(p.y * 10.0 + u_time);
    }

    void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        vec2 m = u_mouse / u_resolution.xy;
        
        // Distancia al mouse para la interacción
        float dist = distance(st, m);
        float interact = 1.0 - smoothstep(0.0, 0.4, dist);
        
        // Crear el efecto de agua fluida
        vec2 p = st * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;
        
        float time = u_time * 0.5;
        for(int i=1; i<5; i++) {
            p.x += 0.3 / float(i) * sin(float(i) * 3.0 * p.y + time + interact * 5.0);
            p.y += 0.3 / float(i) * cos(float(i) * 3.0 * p.x + time + interact * 5.0);
        }
        
        // Colores Tornasol (Iridescent)
        vec3 color1 = vec3(0.5, 0.0, 1.0); // Violeta
        vec3 color2 = vec3(0.0, 0.8, 1.0); // Cyan
        vec3 color3 = vec3(1.0, 0.0, 0.8); // Rosa
        
        vec3 finalColor = mix(color1, color2, 0.5 + 0.5 * sin(p.x + p.y + time));
        finalColor = mix(finalColor, color3, 0.5 + 0.5 * cos(p.x - p.y + time));
        
        // Añadir brillo según la interacción del mouse
        finalColor += interact * 0.3 * vec3(1.0, 1.0, 1.0);
        
        gl_FragColor = vec4(finalColor * 0.6, 1.0);
    }
`;

const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

camera.position.z = 1;

// Interacción del mouse
window.addEventListener('mousemove', (e) => {
    uniforms.u_mouse.value.x = e.clientX;
    uniforms.u_mouse.value.y = window.innerHeight - e.clientY;
});

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value.x = window.innerWidth;
    uniforms.u_resolution.value.y = window.innerHeight;
});

function animate(t) {
    uniforms.u_time.value = t / 1000;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// Animación de la Barra de Navegación al hacer Scroll
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
