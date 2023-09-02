class MowLapse {
    constructor(years, months, milliseconds) {
        this.asMilliseconds = milliseconds;
        this.asSeconds = Math.floor(milliseconds / 1000);
        this.asMinutes = Math.floor(milliseconds / 60000);
        this.asHours = Math.floor(milliseconds / 3600000);
        this.asDays = Math.floor(milliseconds / 86400000);
        this.asWeeks = Math.floor(this.asDays / 7);
        this.asMonths = months;
        this.asYears = years;
    }

    static fromDateTime(start, end) {
        const startDate = new Date(start.year, start.month - 1, start.day, start.hour, start.minute, start.second);
        const endDate = new Date(end.year, end.month - 1, end.day, end.hour, end.minute, end.second);
        return MowLapse.fromMilliseconds(endDate.getTime() - startDate.getTime());
    }

    static fromMilliseconds(milliseconds) {
        return new MowLapse(0, 0, milliseconds);
    }

    plus(other) {
        return MowLapse.fromMilliseconds(this.asMilliseconds + other.asMilliseconds);
    }
    minus(other) {
        return MowLapse.fromMilliseconds(this.asMilliseconds - other.asMilliseconds);
    }
    multiplyBy(other) {
        return MowLapse.fromMilliseconds(this.asMilliseconds * other.asMilliseconds);
    }
    dividedBy(other) {
        return MowLapse.fromMilliseconds(this.asMilliseconds / other.asMilliseconds);
    }
    powerOf(other) {
        return MowLapse.fromMilliseconds(this.asMilliseconds ** other.asMilliseconds);
    }
    rootOf(other) {
        return MowLapse.fromMilliseconds(this.asMilliseconds ** (1 / other.asMilliseconds));
    }
    isLessThan(other) {
        return this.asMinutes < other.asMinutes;
    }
    isEqual(other) {
        return this.asMinutes == other.asMinutes;
    }
    isMoreThan(other) {
        return this.asMinutes > other.asMinutes;
    }
    isMoreOrEqual(other) {
        return this.asMinutes >= other.asMinutes;
    }
    isLessOrEqual(other) {
        return this.asMinutes <= other.asMinutes;
    }
    isZero() {
        return this.asMinutes == 0;
    }
    isPositive() {
        return this.asMinutes > 0;
    }
    isNegative() {
        return this.asMinutes < 0;
    }
}

class MowDate {
    /**
     * @param year Any number
     * @param month From 1 to 12
     * @param day From 1 to -depends on the month-
     */
    constructor(year, month = 1, day = 1) {
        this._year = year;
        this._month = month;
        this._day = day;
        this.adjustDate();
    }

    get year() {
        return this._year;
    }

    set year(value) {
        this._year = value;
        this.adjustDate();
    }

    get month() {
        return this._month;
    }

    set month(value) {
        this._month = value;
        this.adjustDate();
    }

    get day() {
        return this._day;
    }

    set day(value) {
        this._day = value;
        this.adjustDate();
    }

    adjustDate() {
        while (this._day < 1) {
            this._month--;
            if (this._month < 1) {
                this._year--;
                this._month = 12;
            }
            this._day += daysOfMonth(this._year, this._month);
        }
        while (this._day > daysOfMonth(this._year, this._month)) {
            this._day -= daysOfMonth(this._year, this._month);
            this._month++;
            if (this._month > 12) {
                this._year++;
                this._month = 1;
            }
        }
        while (this._month < 1) {
            this._year--;
            this._month += 12;
        }
        while (this._month > 12) {
            this._year++;
            this._month -= 12;
        }
    }

    dayOfWeek() {
        return optionsDaysValues[new Date(this.year, this.month - 1, this.day).getDay()];
    }

    isDayOfWeek(day) {
        return this.dayOfWeek() === day;
    }

    isWeekend() {
        const day = this.dayOfWeek();
        return day === 'sunday' || day === 'saturday';
    }
    /**
     * DD/MM/YYYY
     */
    static fromString(text) {
        const split = text.split("/").map(s => parseInt(s));
        if (split.some(num => isNaN(num))) {
            throw new Error("Invalid date input: '" + text + "'");
        }
        return new MowDate(split[2], split[1], split[0]);
    }

    get netValue() {
        return new Date(this.year, this.month - 1, this.day).getTime();
    }

    isLessThan(other) {
        return this.netValue < other.netValue;
    }
    isEqual(other) {
        return this.netValue == other.netValue;
    }
    isMoreThan(other) {
        return this.netValue > other.netValue;
    }
    isMoreOrEqual(other) {
        return this.netValue >= other.netValue;
    }
    isLessOrEqual(other) {
        return this.netValue <= other.netValue;
    }

    static now() {
        const date = new Date();
        return new MowDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    dayOfYear() {
        return dayOfYear(this.year, this.month, this.day);
    }

    toString(format = "DD/MM/YYYY") {
        return format
            .replace('DD', this.day.toString())
            .replace('MM', this.month.toString())
            .replace('YYYY', this.year.toString());
    }

    copy() {
        return new MowDate(this.year, this.month, this.day);
    }
}

class MowTime {
    _hour = 0;
    get hour() {
        return this._hour;
    }

    set hour(newHour) {
        this._hour = Math.floor(newHour);
        this.adjustTime();
    }

    _minute = 0;
    get minute() {
        return this._minute;
    }

    set minute(newMinute) {
        this._minute = newMinute;
        this.adjustTime();
    }

    _second = 0;
    get second() {
        return this._second;
    }

    set second(newSecond) {
        this._second = newSecond;
        this.adjustTime();
    }

    /**
     * @param hour From 0 to infity
     * @param minute From 0 to 59
     * @param second From 0 to 59
     */
    constructor(hour = 0, minute = 0, second = 0) {
        this._hour = hour;
        this._minute = minute;
        this._second = second;
        this.adjustTime();
    }

    static now() {
        const date = new Date();
        return new MowTime(date.getHours(), date.getMinutes(), date.getSeconds());
    }

    adjustTime() {
        const total = this._hour * 3600 + this._minute * 60 + Math.round(this._second);
        this._hour = Math.floor(total / 3600);
        const remaining = total % 3600;
        this._minute = Math.floor(remaining / 60);
        this._second = remaining % 60;
    }

    get netValue() {
        return this.hour * 3600000 + this.minute * 60000 + this.second * 1000;
    }

    isLessThan(other) {
        return this.netValue < other.netValue;
    }
    isEqual(other) {
        return this.netValue == other.netValue;
    }
    isMoreThan(other) {
        return this.netValue > other.netValue;
    }
    isMoreOrEqual(other) {
        return this.netValue >= other.netValue;
    }
    isLessOrEqual(other) {
        return this.netValue <= other.netValue;
    }

    toString(format = "hh:mm:ss") {
        return format
            .replace('hh', this.hour.toString())
            .replace('mm', this.minute.toString())
            .replace('ss', this.second.toString());
    }

    /**
     * hh:mm:ss
     */
    static fromString(text) {
        const split = text.split(":").map(x => parseInt(x));
        return new MowTime(split[0] ?? 0, split[1] ?? 0, split[2] ?? 0);
    }

    copy() {
        return new MowTime(this.hour, this.minute, this.second);
    }
}

class MowDateTime {
    constructor(year = 1, month = 1, day = 1, hour = 0, minute = 0, second = 0) {
        this.time = new MowTime(hour, minute, second);
        this.date = new MowDate(year, month, day);
        this.hour = this.hour;
    }

    static now() {
        return MowDateTime.fromDateAndTime(
            MowDate.now(),
            MowTime.now()
        );
    }

    static fromDateAndTime(date, time) {
        return new MowDateTime(date.year, date.month, date.day, time.hour, time.minute, time.second);
    }

    toString(format = 'hh:mm:ss DD/MM/YYYY') {
        return format
            .replace('hh', this.hour.toString())
            .replace('mm', this.minute.toString())
            .replace('ss', this.second.toString())
            .replace('DD', this.day.toString())
            .replace('MM', this.month.toString())
            .replace('YYYY', this.year.toString());
    }

    dayOfWeek() {
        return this.date.dayOfWeek();
    }

    isDayOfWeek(day) {
        return this.date.isDayOfWeek(day)
    }

    isWeekend() {
        return this.date.isWeekend();
    }

    static fromString(dateTime) {
        const split = dateTime.split(" ");
        return MowDateTime.fromDateAndTime(
            MowDate.fromString(split[1]),
            MowTime.fromString(split[0])
        );
    }
    // MowDate
    get year() {
        return this.date.year;
    }
    set year(value) {
        this.date.year = value;
    }
    get month() {
        return this.date.month
    }
    set month(value) {
        this.date.month = value;
    }
    get day() {
        return this.date.day;
    }
    set day(value) {
        this.date.day = value;
    }
    dayOfYear() {
        return this.date.dayOfYear();
    }
    // MowTime
    get hour() {
        return this.time.hour;
    }
    set hour(value) {
        const rounded = Math.floor(value);
        const days = rounded < 0 ? Math.ceil(rounded / 24) : Math.floor(rounded / 24);
        const newHour = rounded % 24;
        if (days !== 0) {
            this.day = this.day + days + (newHour < 0 ? -1 : 0);
        }
        this.time.hour = newHour < 0 ? newHour + 24 : newHour;
        if (this.hour === 24) {
            this.time.hour--;
            this.date.day++;
        }
    }
    get minute() {
        return this.time.minute;
    }
    set minute(value) {
        this.time.minute = value;
        this.hour = this.hour;
    }
    get second() {
        return this.time.second;
    }
    set second(value) {
        this.time.second = value;
        this.hour = this.hour;
    }

    get netValue() {
        return new Date(this.year, this.month - 1, this.day, this.hour, this.minute, this.second).getTime();
    }

    isLessThan(other) {
        return this.netValue < other.netValue;
    }
    isEqual(other) {
        return this.netValue == other.netValue;
    }
    isMoreThan(other) {
        return this.netValue > other.netValue;
    }
    isMoreOrEqual(other) {
        return this.netValue >= other.netValue;
    }
    isLessOrEqual(other) {
        return this.netValue <= other.netValue;
    }
    isZero() {
        return this.netValue == 0;
    }
    isPositive() {
        return this.netValue > 0;
    }
    isNegative() {
        return this.netValue < 0;
    }

    copy() {
        return MowDateTime.fromDateAndTime(
            this.date.copy(),
            this.time.copy()
        );
    }
}