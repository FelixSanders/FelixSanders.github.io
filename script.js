var header = document.querySelector(".header");
var headerlogo = document.querySelector(".header-logo");

var onMenu = false;
var onTop = true;

window.addEventListener("scroll", function () {
    var shouldToggle = window.scrollY > 20;
    onTop = !shouldToggle;

    if (!document.querySelector('#sub-page') && !onMenu) {
        header.classList.toggle("visible", shouldToggle);
        headerlogo.classList.toggle("white", shouldToggle);
    }
});

document.querySelector('.header-container1').addEventListener('click', function () {
    if (document.querySelector('#sub-page')) {
        window.location.href = "/";
    } else {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});

if (document.querySelector('#sub-page')) {
    header.classList.add("visible");
    headerlogo.classList.add("white");
}

const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
    onMenu = !onMenu;

    if (onTop && !document.querySelector('#sub-page')) {
        // Toggle visibility and white class if onTop
        header.classList.toggle("visible", onMenu);
        headerlogo.classList.toggle("white", onMenu);
    }

    // Always toggle menu
    menu.classList.toggle("active");
});


const tiltEffectSettings = {
    max: 15, // max tilt rotation (degrees (deg))
    perspective: 1000, // transform perspective, the lower the more extreme the tilt gets (pixels (px))
    scale: 1.1, // transform scale - 2 = 200%, 1.5 = 150%, etc..
    speed: 500, // speed (transition-duration) of the enter/exit transition (milliseconds (ms))
    easing: "cubic-bezier(.03,.98,.52,.99)" // easing (transition-timing-function) of the enter/exit transition
};

const cards = document.querySelectorAll(".tiltable");

cards.forEach(card => {
    card.addEventListener("mouseenter", cardMouseEnter);
    card.addEventListener("mousemove", cardMouseMove);
    card.addEventListener("mouseleave", cardMouseLeave);
});

function cardMouseEnter(event) {
    setTransition(event);
}

function cardMouseMove(event) {
    const card = event.currentTarget;
    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;
    const centerX = card.offsetLeft + cardWidth / 2;
    const centerY = card.offsetTop + cardHeight / 2;
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    const rotateXUncapped = (+1) * tiltEffectSettings.max * mouseY / (cardHeight / 2);
    const rotateYUncapped = (-1) * tiltEffectSettings.max * mouseX / (cardWidth / 2);
    const rotateX = rotateXUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max :
        (rotateXUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateXUncapped);
    const rotateY = rotateYUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max :
        (rotateYUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateYUncapped);

    card.style.transform = `perspective(${tiltEffectSettings.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) 
                            scale3d(${tiltEffectSettings.scale}, ${tiltEffectSettings.scale}, ${tiltEffectSettings.scale})`;
}

function cardMouseLeave(event) {
    event.currentTarget.style.transform = `perspective(${tiltEffectSettings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    setTransition(event);
}

function setTransition(event) {
    const card = event.currentTarget;
    clearTimeout(card.transitionTimeoutId);
    card.style.transition = `transform ${tiltEffectSettings.speed}ms ${tiltEffectSettings.easing}`;
    card.transitionTimeoutId = setTimeout(() => {
        card.style.transition = "";
    }, tiltEffectSettings.speed);
}


const userInput = document.querySelector('.code-input');

if (userInput) {
    userInput.addEventListener('input', function () {
        const inputValue = userInput.value.trim().toLowerCase();
        if (inputValue === '4130') {
            window.location.href = 'secret';
        }
    });
}
