function loadGallery() {
    const gallery = document.getElementById('gallery');
    
    const images = [
        'images/gallery/20231219_Sarangan.png',
        'images/gallery/20240128_MeliaYogyakarta.png',
        'images/gallery/20240703_GWK.png',
        'images/gallery/20240705_GlassBridge.png',
        'images/gallery/20240706_BrokenBeach.png',
        'images/gallery/20240706_NusaPenida.png',
        'images/gallery/20240710_KCICHalim.png',
        'images/gallery/20240710_KCICPadalarang.png',
        'images/gallery/20240710_RRChocolatePI.png',
        'images/gallery/20240728_KliseMataUangORI.png',
        'images/gallery/20240728_MataUangORI.png',
        'images/gallery/20240728_MonumenSeranganUmum1Maret.png',
        'images/gallery/20240813_Ursulin.png',
        'images/gallery/20240815_ChickenSoyuRamen.png',
        'images/gallery/20240829_SekutuKopi.png',
        'images/gallery/20241001_MargiCoffee.png',
        'images/gallery/20241024_Keris.png',
        'images/gallery/20241024_MesinKetikHurufJawa.png',
        'images/gallery/20250905_Kopeng.png',
        'images/gallery/20251012_WestJavaTrain.png',
        'images/gallery/20251217_Klaten.png',
        'images/gallery/20260103_Batu.png',
        'images/gallery/20260424_Orchid.png',
        'images/gallery/20260424_Strobilus.png',
        'images/gallery/20260525_Bali.png',
        'images/gallery/20260605_GrojoganSewu.png'
    ];

    images.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = ''; // No caption
        img.className = 'photo-item';

        
        img.addEventListener('click', () => openLightbox(src));

        img.onerror = function () {
            console.warn(`Failed to load image: ${src}`);
        };

        gallery.appendChild(img);
    });
}

function openLightbox(src) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    const img = document.createElement('img');
    img.src = src;
    img.className = 'lightbox-image';

    
    overlay.addEventListener('click', () => {
        document.body.removeChild(overlay);

        document.body.style.overflow = 'auto';
    });

    overlay.appendChild(img);

    document.body.appendChild(overlay);

    document.body.style.overflow = 'hidden';

}



document.addEventListener('contextmenu', function (event) {
    if (event.target.tagName === 'IMG') {
        event.preventDefault();
    }
});

document.addEventListener('dragstart', function (event) {
    if (event.target.tagName === 'IMG') {
        event.preventDefault();
    }
});

window.addEventListener('load', loadGallery);
