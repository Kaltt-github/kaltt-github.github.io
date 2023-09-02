// Tools
function isValidEmail(email) {
    let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

function randomId(length = 15) {
    if (length < 1) {
        return '';
    }
    const id = Math.round(Math.random() * 60466175).toString(36);
    return id.slice(0, length) + this.randomId(length - id.length);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function limitBetween(min, x, max) {
    return x < min ? min : x > max ? max : x;
}

function numberModulue(x) {
    return x < 0 ? -x : x;
}

function dayOfYear(year, month, day) {
    const date = new Date(year, month - 1, day);
    return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000) + 1;
}

function daysOfMonth(year, month) {
    if (month === 2) {
        if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
            return 29;
        } else {
            return 28;
        }
    } else if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
        return 31;
    } else {
        return 30;
    }
}

function daysOfYear(year) {
    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
        return 366;
    } else {
        return 365;
    }
}

function daysBeforeYear(year) {
    const reduced = year - 1;
    return reduced * 365 + Math.floor(reduced / 4) - Math.floor(reduced / 100) + Math.floor(reduced / 400);
}

function isMobileDevice() {
    return "ontouchstart" in window ||
        (!!window.DocumentTouch && document instanceof DocumentTouch);
}

// Format
function dateToHtml(date) {
    try {
        return date.year
            + '-'
            + ('0'.repeat(2 - date.month.toString().length) + date.month)
            + '-'
            + ('0'.repeat(2 - date.day.toString().length) + date.day);
    } catch (e) {
        throw e;
    }
}

function timeToHtml(time) {
    try {
        if (time.hour === 24) {
            time.hour = 0;
        }
        if (time.hour === -1) {
            time.hour = 23;
        }
        return ('0'.repeat(2 - time.hour.toString().length) + time.hour)
            + ':'
            + ('0'.repeat(2 - time.minute.toString().length) + time.minute);
    } catch (e) {
        throw e;
    }
}

function datetimeToHtml(datetime) {
    return dateToHtml(datetime.date) + 'T' + timeToHtml(datetime.time);
}

function dateFromHtml(string) {
    return MowDate.fromString(string.split('-').reverse().join('/'));
}

function timeFromHtml(string) {
    return MowTime.fromString(string);
}

function datetimeFromHtml(string) {
    const data = string.split('T');
    return MowDateTime.fromDateAndTime(
        dateFromHtml(data[0]),
        timeFromHtml(data[1])
    );
}

// On Screen
async function showNotification(icon = "warning", text = "", color = 0) {
    if (!notifications) {
        return;
    }
    const buttoncolor = BackColor.fromHSV(color, 65, 60).toString();
    let clicked = false;

    const elm = document.createElement('li');
    elm.style.backgroundColor = BackColor.fromHSV(color, 71, 79).toString();
    elm.onclick = () => {
        if (clicked) {
            elm.remove();
        } else {
            clicked = true;
        }
    }

    const ico = document.createElement('div');
    ico.className = "notificationitem";
    ico.style.backgroundColor = buttoncolor;

    const txt = document.createElement('p');
    txt.textContent = text;

    elm.appendChild(ico);
    elm.appendChild(txt);
    notifications.appendChild(elm);
    await delay(Math.max(5000, text.split(' ').length * 1000));
    if (!clicked) {
        elm?.remove();
    }
}

/**
 * {
 * message: string,
 * buttons: [{label: string, onclick: () => boolean}] // True => cerrar pop up
 * }
 */
function popUp(params) {
    const message = document.createElement('p');
    message.classList.add('message');
    message.textContent = params.message;

    const buttons = document.createElement('div');
    buttons.classList.add('buttons');

    const container = document.createElement('div');
    container.classList.add('container');
    container.appendChild(message);
    container.appendChild(buttons);

    const screen = document.createElement('div');
    screen.classList.add('popup');
    screen.appendChild(container);

    for (const button of params.buttons) {
        const element = document.createElement('button');
        element.textContent = button.label;
        element.onclick = () => {
            if (button.onclick()) {
                screen.remove();
            }
        };
        buttons.appendChild(element);
    }

    document.body.appendChild(screen);
}
