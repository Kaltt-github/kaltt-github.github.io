const colorMain = 'var(--color-main)';
const colorDark = 'var(--color-dark)';
const colorQuarterdark = 'var(--color-quarterdark)';
const colorHalfdark = 'var(--color-halfdark)';

const optionsEventInteractions = ['none', 'completed', 'cancelled'];

const optionsEventStatus = ['waiting', 'expired', 'active', 'completed', 'cancelled'];
const optionsEventStatusValues = ['Esperando...', 'Expirado', 'Activo', 'Completado', 'Cancelado'];

const optionsLapse = ['minutos', 'horas', 'dias', 'semanas', 'meses', 'años'];
const optionsLapseValues = ['minute', 'hour', 'day', 'week', 'month', 'year'];

const optionsDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const optionsDaysValues = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const optionsEventTypes = ['father', 'repeat'];

const workerVersion = '3';

const data = new DataManager();
const auth = new AuthManager();

const root = document.documentElement;
var notifications;
const screenHome = new FrontScreenHome();
const screenEdit = new FrontScreenEdit();
const screenLogin = new FrontScreenLogin();

window.onload = () => {
    notifications = document.getElementById("notifications");
    document.body.appendChild(screenHome.div);
    document.body.appendChild(screenEdit.div);
    document.body.appendChild(screenLogin.div);
    screenHome.open();
    auth.watchToken();
};

window.onerror = function (message, source, line, column, error) {
    showNotification('warning', 'Error: ' + message + ' (' + line + ')', 0);
    console.trace();
    throw error;
};

async function checkServiceWorker() {
    const serviceWorkers = await navigator.serviceWorker.getRegistrations();
    const serviceWorker = serviceWorkers[0];

    if(!serviceWorker) {
        try {
            await navigator.serviceWorker.register('service-worker.js');
            localStorage.setItem('lastWorker', workerVersion);
            console.info('🔵 Service worker: Registered');
            window.location.reload();
        } catch (e) {
            console.info('🔵 Service worker: Register Failure');
            throw e;
        }
        return;
    }

    console.info('🔵 Service worker: Detected');
    const currentVersion = localStorage.getItem('lastWorker');
    if(currentVersion === workerVersion) {
        return;
    }
    try {
        localStorage.setItem('lastWorker', workerVersion);
        await serviceWorker.update();
        console.info('🔵 Service worker: Updated');
        window.location.reload();
    } catch (e) {
        console.info('🔵 Service worker: Update failure');
        throw e;
    }
}
if ('serviceWorker' in navigator) {
    checkServiceWorker();
}