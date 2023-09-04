var storage;
const request = indexedDB.open('eventlistdatabase', 2);

request.onerror = function (event) {
    console.error('🟢 Indexed Database: Open failure');
};

request.onsuccess = function (event) {
    storage = event.target.result;
    console.info('🟢 Indexed Database: Opened');
};

request.onupgradeneeded = function (event) {
    storage = event.target.result;

    if (!storage.objectStoreNames.contains('events')) {
        storage.createObjectStore('events', { keyPath: 'id' });
    }
    if (!storage.objectStoreNames.contains('tags')) {
        storage.createObjectStore('tags', { keyPath: 'id' });
    }
    if (!storage.objectStoreNames.contains('docs')) {
        storage.createObjectStore('docs', { keyPath: 'id' });
    }

    console.info('🟢 Indexed Database: Upgraded');
};

class FirebaseController {
    constructor() {
        this.initialized = false;
    }

    get db() {
        this.intialize();
        if (!this._firestore) {
            try {
                this._firestore = firebase?.firestore();
            } catch (e) { }
        }
        return this._firestore;
    }

    get collectionEvents() {
        if (!this._collectionEvents) {
            this._collectionEvents = this.db?.collection('events');
        }
        return this._collectionEvents;
    }

    get collectionUsers() {
        if (!this._collectionUsers) {
            this._collectionUsers = this.db?.collection('users');
        }
        return this._collectionUsers;
    }

    intialize() {
        if (!navigator.onLine || this.initialized) {
            return;
        }
        this.initialized = true;
        firebase.initializeApp({
            apiKey: "AIzaSyBkYSEd8nx0NZqkjrcEzFtFrFF3kibv4jY",
            authDomain: "eventlist-4bd1d.firebaseapp.com",
            projectId: "eventlist-4bd1d",
            storageBucket: "eventlist-4bd1d.appspot.com",
            messagingSenderId: "216085604744",
            appId: "1:216085604744:web:d2faae42f18d46b8a8f23d"
        });
    }
}
const fb = new FirebaseController();

class DataManager {
    constructor() {
        this.waitingSetList = new Map();
        this.waitingDeleteList = new Set();
        this.waitingList = new Map();
        this.counting = false;
    }

    clearCache() {
        const transaction = storage.transaction('events', 'readwrite');
        const eventsStore = transaction.objectStore('events');
        eventsStore.clear();
        auth.deleteUserData();
        screenHome.eventsMap.clear();
        screenHome.eventsList.splice(0, screenHome.eventsList.length);
    }

    async getDelayeds() {
        while (!storage) {
            console.info('🟢 Indexed Database: Waiting...');
            await delay(1000);
        }
        return new Promise((resolve, reject) => {
            const transaction = storage.transaction('docs', 'readwrite');
            const docsStore = transaction.objectStore('docs');
            const request = docsStore.getAll()
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    rejectDelayeds(ids) {
        if(ids.length > 0) {
            const transaction = storage.transaction('docs', 'readwrite');
            const docsStore = transaction.objectStore('docs');
            for(const id of ids) {
                docsStore.delete(id);
            }
        }
    }

    get hasPendingDocs() {
        return localStorage.getItem('pendingDocs') === 'true';
    }

    set hasPendingDocs(value) {
        localStorage.setItem('pendingDocs', value);
    }

    async saveEvent(event, scopes = ['online', 'local']) {
        return this.saveEvents([event], scopes);
    }

    async saveEvents(events, scopes = ['online', 'local']) {
        const unique = new Map();
        const now = Date.now();

        const transaction = storage.transaction('events', 'readwrite');
        const eventsStore = transaction.objectStore('events');
        const setLocal = scopes.includes('local');

        for (const event of events) {
            let result;
            if (event.type === 'father') {
                result = event;
            }
            if (event.type === 'repeat') {
                result = event.father;
            }
            if (unique.has(result.id)) {
                continue;
            }
            unique.set(result.id, result);
            result.lastUpdate = now;
            if (setLocal) {
                eventsStore.put(result.toJson());
            }
        }

        if (scopes.includes('online')) {
            return this.batch('set', unique.values());
        }
    }

    async deleteEvent(event, scopes = ['online', 'local']) {
        return this.deleteEvents([event], scopes);
    }

    async deleteEvents(events, scopes = ['online', 'local']) {
        const transaction = storage.transaction('events', 'readwrite');
        const eventsStore = transaction.objectStore('events');
        const setLocal = scopes.includes('local');

        const unique = new Map();

        for (const event of events) {
            let result;
            if (event.type === 'father') {
                result = event;
            }
            if (event.type === 'repeat') {
                result = event.father;
            }
            if (unique.has(result.id)) {
                continue;
            }
            unique.set(result.id, result);
            if (setLocal) {
                eventsStore.delete(result.id);
            }
        }
        if (scopes.includes('online')) {
            return this.batch('delete', unique.values());
        }
    }

    async batch(action, events) {
        if (action === 'set') {
            for (const event of events) {
                this.waitingList.set(event.id, event.toJson());

                this.waitingDeleteList.delete(event.id);
                this.waitingSetList.set(event.id, event);
            }
        } else if (action === 'delete') {
            const email = auth.getUserData().email;
            const now = Date.now();
            for (const event of events) {
                this.waitingList.set(event.id, {
                    id: event.id,
                    lastUpdate: now,
                    deleted: true,
                    owner: email,
                });
            }
        }

        if (this.counting) {
            return;
        }
        this.counting = true;
        await delay(1500);
        this.counting = false;
        this.setDocs([...this.waitingList.values()]);
    }

    async setDocs(docs, makeBackup = true) {
        if (auth.tokenVerified && navigator.onLine) {
            if (docs.length === 0) {
                return true;
            }
            if (docs.length === 1) {
                await fb.collectionEvents.doc(docs[0].id).set(docs[0]);
                return true;
            }
            const batch = fb.db.batch();
            for (const doc of docs) {
                batch.set(fb.collectionEvents.doc(doc.id), doc);
            }
            try {
                await batch.commit();
            } catch (e) {
                return false;
            }
            return true;
        } 
        if(makeBackup) {
            const transaction = storage.transaction('docs', 'readwrite');
            const docsStore = transaction.objectStore('docs');
            localStorage.setItem('pendingDocs', true);
            for (const doc of docs) {
                docsStore.put(doc);
            }
        }
        return false;
    }

    async fetchEvents(email) {
        if (!navigator.onLine) {
            return [];
        }
        const query = await fb.collectionEvents.where('owner', '==', email).get();
        const events = [];
        const deleted = [];
        for (const doc of query.docs) {
            const data = doc.data();
            if (data['deleted']) {
                deleted.push(data['id']);
            } else {
                events.push(MowEvent.fromJson(data));
            }
        }
        return { events, deleted };
    }

    getLocalEvents() {
        return new Promise(async (resolve, reject) => {
            while (!storage) {
                console.info('🟢 Indexed Database: Waiting...');
                await delay(1000);
            }
            const transaction = storage.transaction('events', 'readonly');
            const eventsStore = transaction.objectStore('events');
            const getRequest = eventsStore.getAll();

            getRequest.onsuccess = function (event) {
                const events = event.target.result;
                resolve(events.map(event => MowEvent.fromJson(event)));
            };

            getRequest.onerror = function (event) {
                console.error('🟢 Indexed Database: Get local events failure');
                reject(event.target.error);
            };
        });
    }
}

class AuthManager {
    constructor() {
        this.tokenVerified = false;
    }

    async checkToken() {
        if (
            screenLogin.isOpen ||
            this.tokenVerified ||
            !navigator.onLine
        ) {
            return true;
        }
        const olddata = this.getUserData();
        if (!olddata || Object.keys(olddata).length === 0) {
            console.info('🟡 Auth: User Data missing');
            data.clearCache();
            screenLogin.open();
            return false;
        }
        const newdata = await auth.loginWithToken(olddata.email, olddata.token);
        if (!newdata) {
            console.info('🟡 Auth: User Data expired');
            data.clearCache();
            showNotification('check', 'Expiro la sesion', 120);
            screenLogin.open();
            return false;
        }
        console.info('🟡 Auth: User Data updated');
        auth.tokenVerified = true;
        auth.setUserData(newdata.email, newdata.name, olddata.token);
        return true;
    }

    async canUseEmail(email) {
        if (!navigator.onLine) {
            return false;
        }
        return (await fb.collectionUsers.where('email', '==', email).limit(1).get()).size === 0;
    }

    async getNameByEmail(email) {
        if (!navigator.onLine) {
            return 'Sin coneccion';
        }
        return ((await fb.collectionUsers.where('email', '==', email).limit(1).get()).docs[0])?.data().name;
    }

    async addUser(email, name, password) {
        if (!navigator.onLine) {
            return;
        }
        const token = randomId(30);
        await fb.collectionUsers.doc(token).set({ email, name, password });
        return token;
    }

    async loginWithPassword(email, password) {
        if (!navigator.onLine) {
            return;
        }
        const doc = (await fb.collectionUsers
            .where('email', '==', email)
            .where('password', '==', password)
            .limit(1).get()).docs[0];
        if (!doc) {
            return;
        }
        const result = doc.data();
        result.token = doc.id;
        return result;
    }

    async loginWithToken(email, token) {
        if (!navigator.onLine) {
            return;
        }
        return ((await fb.collectionUsers
            .where(firebase.firestore.FieldPath.documentId(), '==', token)
            .where('email', '==', email)
            .limit(1).get()).docs[0])?.data();
    }

    setUserData(email, name, token) {
        const userData = {
            email: email,
            name: name,
            token: token
        };
        const userDataJSON = JSON.stringify(userData);
        localStorage.setItem('userData', userDataJSON);
    }

    getUserData() {
        const userDataJSON = localStorage.getItem('userData');
        return userDataJSON ? JSON.parse(userDataJSON) : null;
    }

    deleteUserData() {
        localStorage.removeItem('userData');
        this.tokenVerified = false;
    }
}
