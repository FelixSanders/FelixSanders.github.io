window.addEventListener("scroll", function () {
    var header = document.querySelector(".header");
    var headerlogo = document.querySelector(".header-logo");

    var shouldToggle = window.scrollY > 20;
    header.classList.toggle("visible", shouldToggle);
    headerlogo.classList.toggle("white", shouldToggle);
});