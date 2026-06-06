// ====================================
// LA GUAJIRA - LANDING PAGE PREMIUM
// Sistema de Encuesta + Interactividad
// ====================================

'use strict';

// ====================================
// VARIABLES GLOBALES
// ====================================

const SURVEY_KEY = 'laguajira_survey_completed';
const SURVEY_DATA_KEY = 'laguajira_survey_data';
const NEWSLETTER_KEY = 'laguajira_subscribers';

const surveyOverlay = document.getElementById('surveyOverlay');
const mainContent = document.getElementById('mainContent');
const surveyForm = document.getElementById('surveyForm');
const otherVisitorInput = document.getElementById('otherVisitorType');
const visitorTypeRadios = document.querySelectorAll('input[name="visitorType"]');
const logoutBtn = document.getElementById('logoutBtn');

// Elementos de navegación
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// ====================================
// INICIALIZACIÓN
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya completó encuesta
    if (hasSurveyBeenCompleted()) {
        showMainContent();
        initMainPageInteractions();
    } else {
        showSurvey();
        // Detectar scroll en encuesta para mejorar UX
        detectSurveyScroll();
    }

    // Event listeners
    surveyForm?.addEventListener('submit', handleSurveySubmit);
    visitorTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleVisitorTypeChange);
    });
    logoutBtn?.addEventListener('click', handleLogout);

    // Scroll animations
    window.addEventListener('scroll', handleNavbarScroll);

    // Mobile menu
    hamburger?.addEventListener('click', toggleMobileMenu);
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenuOnNavLink);
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });

    console.log('%c🏜️ La Guajira - Landing Premium Cargada', 'color: #0096C7; font-size: 14px; font-weight: bold;');
});

// ====================================
// ENCUESTA - FUNCIONES PRINCIPALES
// ====================================

/**
 * Verifica si la encuesta ya fue completada
 */
function hasSurveyBeenCompleted() {
    return localStorage.getItem(SURVEY_KEY) !== null;
}

/**
 * Muestra la pantalla de encuesta
 */
function showSurvey() {
    surveyOverlay.classList.add('active');
    surveyOverlay.classList.remove('hidden');
    mainContent.classList.add('hidden');

    // Bloquear scroll del body cuando la encuesta está activa
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
}

/**
 * Muestra el contenido principal
 */
function showMainContent() {
    surveyOverlay.classList.remove('active');
    surveyOverlay.classList.add('hidden');
    mainContent.classList.remove('hidden');

    // Restaurar scroll del body
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

/**
 * Obtiene el ancho de la scrollbar para evitar layout shift
 */
function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

/**
 * Detecta si la encuesta tiene scroll y muestra indicador
 */
function detectSurveyScroll() {
    const surveyCard = document.querySelector('.survey-card');

    if (!surveyCard) return;

    const checkScroll = () => {
        const hasVerticalScroll = surveyCard.scrollHeight > surveyCard.clientHeight;

        if (hasVerticalScroll) {
            surveyCard.classList.add('has-scroll');
        } else {
            surveyCard.classList.remove('has-scroll');
        }
    };

    // Verificar al cargar
    setTimeout(checkScroll, 100);

    // Verificar al redimensionar
    window.addEventListener('resize', checkScroll);

    // Verificar al hacer scroll
    surveyCard.addEventListener('scroll', () => {
        const isAtBottom = surveyCard.scrollTop + surveyCard.clientHeight >= surveyCard.scrollHeight - 10;

        if (isAtBottom) {
            surveyCard.classList.add('at-bottom');
        } else {
            surveyCard.classList.remove('at-bottom');
        }
    });
}

/**
 * Maneja el envío de la encuesta
 */
function handleSurveySubmit(event) {
    event.preventDefault();

    // Obtener valores
    const age = document.getElementById('age').value;
    const origin = document.getElementById('origin').value;
    const visitorType = document.querySelector('input[name="visitorType"]:checked')?.value;
    let visitorTypeLabel = visitorType;

    // Si es "otro", obtener texto adicional
    if (visitorType === 'otro') {
        const otherText = otherVisitorInput.value.trim();
        if (!otherText) {
            showNotification('Por favor, especifica tu tipo de visitante', 'error');
            return;
        }
        visitorTypeLabel = otherText;
    }

    // Validar campos
    if (!age || !origin || !visitorType) {
        showNotification('Por favor, completa todos los campos obligatorios', 'error');
        return;
    }

    // Crear objeto de datos
    const surveyData = {
        age,
        origin,
        visitorType: visitorTypeLabel,
        timestamp: new Date().toISOString()
    };

    // Guardar en localStorage
    saveSurveyData(surveyData);

    // Mostrar contenido principal
    showMainContent();
    initMainPageInteractions();

    // Feedback visual
    showNotification('¡Bienvenido! Esperamos que disfrutes tu visita', 'success');

    console.log('✓ Encuesta completada:', surveyData);
}

/**
 * Guarda los datos de la encuesta
 */
function saveSurveyData(data) {
    // Marcar como completado
    localStorage.setItem(SURVEY_KEY, JSON.stringify({
        completed: true,
        timestamp: new Date().toISOString()
    }));

    // Guardar datos anónimos
    const allResponses = JSON.parse(localStorage.getItem(SURVEY_DATA_KEY) || '[]');
    allResponses.push(data);
    localStorage.setItem(SURVEY_DATA_KEY, JSON.stringify(allResponses));
}

/**
 * Maneja cambio en tipo de visitante
 */
function handleVisitorTypeChange(event) {
    if (event.target.value === 'otro') {
        otherVisitorInput.style.display = 'block';
        otherVisitorInput.focus();
    } else {
        otherVisitorInput.style.display = 'none';
        otherVisitorInput.value = '';
    }
}

/**
 * Maneja cerrar sesión (volver a encuesta)
 */
function handleLogout() {
    const confirmed = confirm('¿Deseas cerrar sesión? Tendrás que completar la encuesta nuevamente.');

    if (confirmed) {
        localStorage.removeItem(SURVEY_KEY);
        location.reload();
    }
}

// ====================================
// PÁGINA PRINCIPAL - INTERACTIVIDAD
// ====================================

/**
 * Inicializa interacciones de la página principal
 */
function initMainPageInteractions() {
    // Animaciones al hacer scroll
    initScrollAnimations();

    // Newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    newsletterForm?.addEventListener('submit', handleNewsletterSubmit);

    // Lazy loading
    initLazyLoading();
}

/**
 * Maneja scroll de navbar
 */
function handleNavbarScroll() {
    if (window.scrollY > 100) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
}

/**
 * Alterna menú móvil
 */
function toggleMobileMenu() {
    navMenu?.classList.toggle('active');
    hamburger?.classList.toggle('active');
}

/**
 * Cierra menú al navegar
 */
function closeMenuOnNavLink() {
    navMenu?.classList.remove('active');
    hamburger?.classList.remove('active');
}

/**
 * Smooth scroll personalizado
 */
function handleSmoothScroll(event) {
    const href = event.currentTarget.getAttribute('href');

    if (href.startsWith('#') && mainContent.classList.contains('hidden') === false) {
        event.preventDefault();

        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// ====================================
// ANIMACIONES AL HACER SCROLL
// ====================================

/**
 * Implementa scroll animations con Intersection Observer
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.getAttribute('data-aos-delay') || '0';

                element.style.opacity = '1';
                element.style.animation = `fadeUp 0.8s ease-out ${delay}ms forwards`;

                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observar elementos con data-aos
    document.querySelectorAll('[data-aos]').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// ====================================
// LAZY LOADING DE IMÁGENES
// ====================================

/**
 * Implementa lazy loading para imágenes
 */
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.style.opacity = '1';
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img').forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease-out';
            imageObserver.observe(img);
        });
    }
}

// ====================================
// NEWSLETTER
// ====================================

/**
 * Maneja envío de newsletter
 */
function handleNewsletterSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const btn = form.querySelector('button');

    // Validar email
    if (!isValidEmail(email)) {
        showNotification('Por favor, ingresa un email válido', 'error');
        return;
    }

    // Simular envío
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    setTimeout(() => {
        // Guardar suscriptor
        const subscribers = JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || '[]');
        subscribers.push({
            email,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(subscribers));

        // Feedback
        showNotification('¡Suscripción confirmada! Revisa tu email', 'success');
        form.reset();

        btn.disabled = false;
        btn.innerHTML = originalText;

        console.log(`📧 Nuevo suscriptor: ${email}`);
    }, 1500);
}

// ====================================
// UTILIDADES
// ====================================

/**
 * Valida formato de email
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Muestra notificaciones
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = {
        success: '#28a745',
        error: '#dc3545',
        info: '#0096C7'
    }[type] || '#0096C7';

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        background: ${bgColor};
        color: white;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        font-weight: 500;
        font-size: 14px;
        z-index: 2000;
        animation: slideInRight 0.4s ease-out;
        max-width: 300px;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-out forwards';
        setTimeout(() => notification.remove(), 400);
    }, 4000);
}

// ====================================
// ANÁLISIS Y DEBUGGING
// ====================================

/**
 * Obtiene datos de encuestas respondidas
 */
window.getSurveyStats = function() {
    const responses = JSON.parse(localStorage.getItem(SURVEY_DATA_KEY) || '[]');

    if (responses.length === 0) {
        console.log('No hay respuestas registradas aún');
        return null;
    }

    const stats = {
        totalResponses: responses.length,
        ageDistribution: {},
        originDistribution: {},
        visitorTypeDistribution: {}
    };

    responses.forEach(response => {
        stats.ageDistribution[response.age] =
            (stats.ageDistribution[response.age] || 0) + 1;
        stats.originDistribution[response.origin] =
            (stats.originDistribution[response.origin] || 0) + 1;
        stats.visitorTypeDistribution[response.visitorType] =
            (stats.visitorTypeDistribution[response.visitorType] || 0) + 1;
    });

    return stats;
};

/**
 * Obtiene datos de suscriptores
 */
window.getSubscriberStats = function() {
    const subscribers = JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || '[]');
    return {
        totalSubscribers: subscribers.length,
        subscribers: subscribers,
        latest: subscribers[subscribers.length - 1]?.email || 'N/A'
    };
};

/**
 * Limpia datos (para testing)
 */
window.clearAllData = function() {
    localStorage.removeItem(SURVEY_KEY);
    localStorage.removeItem(SURVEY_DATA_KEY);
    localStorage.removeItem(NEWSLETTER_KEY);
    console.log('✓ Todos los datos han sido eliminados');
};

console.log('%c💡 Comandos disponibles:', 'color: #F77F00; font-weight: bold;');
console.log('getSurveyStats() - Ver estadísticas de encuestas');
console.log('getSubscriberStats() - Ver suscriptores');
console.log('clearAllData() - Limpiar datos (testing)');
