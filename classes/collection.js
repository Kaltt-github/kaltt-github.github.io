class Collection {
    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.size) {
                    return {
                        value: this.values()[index++],
                        done: false
                    };
                } else {
                    return {
                        value: undefined,
                        done: true
                    };
                }
            }
        };
    }

    get isEmpty() {
        return this.size === 0;
    }

    get isNotEmpty() {
        return this.size !== 0;
    }

    get size() {
        return this._values.size;
    }

    constructor(identifier, initialValues) {
        this.identifier = identifier;
        this._values = new Map();
        if (initialValues) {
            this.set(...initialValues);
        }
    }

    get(...key) {
        if (!key || key.size === 0) {
            return null;
        }
        const result = key.map(k => this._values.get(k) ?? null);
        return result.size === 1
            ? result[0]
            : result;
    }

    getBy(identifier, ...value) {
        const result = [];
        for (const element of this._values.values()) {
            if (value.includes(element[identifier])) {
                result.push(element);
            }
        }
        return result.size === 1
            ? result[0]
            : result;
    }

    hasKey(key) {
        return !!this._values.get(key);
    }

    hasNotKey(key) {
        return !this._values.get(key);
    }

    hasAllKeys(keys) {
        for (const key of keys) {
            if (!this._values.get(key)) {
                return false;
            }
        }
        return true;
    }

    hasSomeKeys(keys, amount = 1) {
        let count = 0;
        for (const key of keys) {
            if (this._values.get(key)) {
                count++;
                if (count >= amount) {
                    return true;
                }
            }
        }
        return false;
    }

    hasNoneKeys(keys) {
        for (const key of keys) {
            if (this._values.get(key)) {
                return false;
            }
        }
        return true;
    }

    hasValue(value) {
        return !!this._values.get(value[this.identifier]);
    }

    hasNotValue(value) {
        return !this._values.get(value[this.identifier]);
    }

    hasAllValues(values) {
        for (const value of values) {
            if (!this._values.get(value[this.identifier])) {
                return false;
            }
        }
        return true;
    }

    hasSomeValues(values, amount = 1) {
        let count = 0;
        for (const value of values) {
            if (this._values.get(value[this.identifier])) {
                count++;
                if (count >= amount) {
                    return true;
                }
            }
        }
        return false;
    }

    hasNoneValues(values) {
        for (const value of values) {
            if (this._values.get(value[this.identifier])) {
                return false;
            }
        }
        return true;
    }

    /**
     * @param {(value: element, key: identifier) => boolean} predicate 
     */
    doesEvery(predicate) {
        for (const [key, value] of this._values.entries()) {
            if (!predicate(value, key)) {
                return false;
            }
        }
        return true;
    }

    /**
     * @param {(value: element, key: identifier) => boolean} predicate 
     */
    doesAny(predicate) {
        for (const [key, value] of this._values.entries()) {
            if (!predicate(value, key)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {(value: element, key: identifier) => boolean} predicate 
     */
    doesNone(predicate) {
        for (const [key, value] of this._values.entries()) {
            if (predicate(value, key)) {
                return false;
            }
        }
        return true;
    }

    copy() {
        return new Collection(
            this.identifier,
            this._values.values()
        );
    }

    keys() {
        return [...this._values.keys()];
    }

    values() {
        return [...this._values.values()];
    }

    entries() {
        return [...this._values.entries()];
    }

    /**
     * @param {(value: element, key: identifier) => boolean} predicate 
     */
    where(predicate) {
        const result = [];
        for (const [key, value] of this._values.entries()) {
            if (predicate(value, key)) {
                result.push(value);
            }
        }
        return new Collection(this.identifier, result);
    }

    /**
     * @param {(value: any, index: number, array: any[]) => any} predicate 
     */
    whereToArray(predicate) {
        return this.values().filter(predicate)
    }

    /**
     * @param {(value: element, key: identifier)} predicate 
     */
    map(predicate) {
        const result = [];
        for (const [key, value] of this._values.entries()) {
            result.push(predicate(value, key));
        }
        return result;
    }

    /**
     * @param {(value: any, index: number, array: any[]) => any} predicate 
     */
    mapToArray(predicate) {
        return this.values().map(predicate)
    }

    /**
     * @param {(value: element, key: identifier) => any} predicate 
     */
    mapWhere(predicate) {
        const result = [];
        for (const [key, value] of this._values.entries()) {
            const e = predicate(value, key);
            if (e) {
                result.push(e);
            }
        }
        return result;
    }

    set(...values) {
        for (const value of values) {
            this._values.set(value[this.identifier], value);
        }
    }

    /**
    * @param {(value: element, key: identifier) => boolean} predicate 
    */
    countWhere(predicate) {
        const result = 0;
        for (const [key, value] of this._values.entries()) {
            if (predicate(value, key)) {
                result++;
            }
        }
        return result;
    }

    clear() {
        const previous = this.copy();
        this._values.clear();
        return previous;
    }

    deleteKey(...keys) {
        const values = new Array();
        for (const key of keys) {
            const value = this._values.get(key);
            if (value) {
                values.push(value);
                this._values.delete(key);
            }
        }
        return new Collection(
            this.identifier,
            values
        );
    }

    deleteValue(...value) {
        return this.deleteKey(...value.map(v => v[this.identifier]));
    }

    asMap() {
        return new Map(this.entries());
    }

    asArray() {
        return this.values();
    }

    asIndexed() {
        return new CollectionIndex(
            this.identifier,
            this.values()
        )
    }

    /**
     * @param {(a, b) => number} comparator 
     */
    asSorted(comparator) {
        return new CollectionOrder(
            this.identifier,
            comparator,
            this.values()
        )
    }
}

class CollectionIndex extends Collection {
    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.length) {
                    return {
                        value: this._order[index++],
                        done: false
                    };
                } else {
                    return {
                        value: undefined,
                        done: true
                    };
                }
            }
        };
    }

    get length() {
        return this._order.length;
    }

    get first() {
        return this.at(0);
    }

    get last() {
        return this.at(this.length - 1);
    }

    constructor(identifier, initialValues) {
        super(identifier);
        this._order = new Array();
        if (initialValues) {
            this.set(...initialValues);
        }
    }

    at(...index) {
        if (!index || index.length === 0) {
            return null;
        }
        const result = index.map(i => this._values.get(this._order[i]) ?? null);
        return result.length === 1
            ? result[0]
            : result;
    }

    indexOfKey(...key) {
        const result = key.map(k => this._order.indexOf(k))
        return result.length === 1
            ? result[0]
            : result;
    }

    indexOfValue(...value) {
        return this.indexOfKey(...value.map(v => v[this.identifier]));
    }

    /**
     * @param {(value: element, key: identifier, index: number, self: Array) => boolean} predicate 
     */
    doesEvery(predicate) {
        const self = this._order.map(key => this._values.get(key));
        for (let index = 0; index < self.length; index++) {
            const element = self[index];
            if (!predicate(element, element[this.identifier], index, self)) {
                return false;
            }
        }
        return true;
    }

    /**
     * @param {(value: element, key: identifier, index: number, self: Array) => boolean} predicate 
     */
    doesAny(predicate) {
        const self = this._order.map(key => this._values.get(key));
        for (let index = 0; index < self.length; index++) {
            const element = self[index];
            if (predicate(element, element[this.identifier], index, self)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {(value: element, key: identifier, index: number, self: Array) => boolean} predicate 
     */
    doesNone(predicate) {
        const self = this._order.map(key => this._values.get(key));
        for (let index = 0; index < self.length; index++) {
            const element = self[index];
            if (predicate(element, element[this.identifier], index, self)) {
                return false;
            }
        }
        return true;
    }

    copy(start, end) {
        return new CollectionIndex(
            this.identifier,
            this._order
                .slice(start, end)
                .map(key => this._values.get(key))
        );
    }

    indexes() {
        return this._order.map((key, index) => [index, this._values.get(key)]);
    }

    /**
     * @param {(value: element, key: identifier, index: number, self: Array) => boolean} predicate 
     */
    where(predicate) {
        const result = [];
        const self = this._order.map(key => this._values.get(key));
        for (let index = 0; index < self.length; index++) {
            const element = self[index];
            if (predicate(element, element[this.identifier], index, self)) {
                result.push(element);
            }
        }
        return new CollectionIndex(this.identifier, result);
    }

    /**
     * @param {(value: element, key: identifier, index: number, self: Array)} predicate 
     */
    map(predicate) {
        const result = [];
        const self = this._order.map(key => this._values.get(key));
        for (let index = 0; index < self.length; index++) {
            const element = self[index];
            result.push(
                predicate(element, element[this.identifier], index, self)
            );
        }
        return result;
    }

    /**
     * @param {(value: element, key: identifier, index: number, self: Array) => any} predicate 
     */
    mapWhere(predicate) {
        const result = [];
        const self = this._order.map(key => this._values.get(key));
        for (let index = 0; index < self.length; index++) {
            const element = self[index];
            const value = predicate(element, element[this.identifier], index, self);
            if (value) {
                result.push(value);
            }
        }
        return result;
    }

    /**
     * @param {(value: element, key: identifier, index: number, self: Array) => boolean} predicate 
     */
    firstWhere(predicate, ignore = 0) {
        let count = 0;
        const self = this._order.map(key => this._values.get(key));
        for (let index = 0; index < self.length; index++) {
            const element = self[index];
            if (predicate(element, element[this.identifier], index, self)) {
                count++;
                if (count > ignore) {
                    return element;
                }
            }
        }
        return null;
    }

    /**
     * @param {(value: element, key: identifier, index: number, self: Array) => boolean} predicate 
     */
    lastWhere(predicate, ignore = 0) {
        let count = 0;
        const self = this._order.map(key => this._values.get(key));
        for (let index = self.length - 1; index >= 0; index++) {
            const element = self[index];
            if (predicate(element, element[this.identifier], index, self)) {
                count++;
                if (count > ignore) {
                    return element;
                }
            }
        }
        return null;
    }

    cut(start, end) {
        return new CollectionIndex(
            this.identifier,
            this._order
                .splice(start, end)
                .map(key => this._values.get(key))
        );
    }

    set(...values) {
        const keys = [];
        for (const value of values) {
            const key = value[this.identifier];
            keys.push(key);
            this._values.set(key, value);
        }
        this._order = this._order.filter(key => !keys.includes(key));
        this._order.push(...keys);
    }

    setAt(index, ...values) {
        const keys = [];
        for (const value of values) {
            const key = value[this.identifier];
            keys.push(key);
            this._order.push(key);
            this._values.set(key, value);
        }
        this._order = this._order.filter((key, i) => 
            (i > index && i <= index + keys.length) ||
            !keys.includes(key)
        )
    }

    setBeforeKey(before, ...values) {
        this.setAt(this.indexOfKey(before) - 1, ...values);
    }

    setAfterKey(after, ...values) {
        this.setAt(this.indexOfKey(after), ...values);
    }

    setBeforeValue(before, ...values) {
        this.setAt(this.indexOfValue(before) - 1, ...values);
    }

    setAfterValue(after, ...values) {
        this.setAt(this.indexOfValue(after), ...values);
    }

    /**
     * @param {(result, element) => newresult} predicate 
     */
    reduce(predicate, initialValue) {
        for (const value of this.values()) {
            initialValue = predicate(initialValue, value);
        }
        return initialValue;
    }

    reverse() {
        this._order.reverse();
        return this;
    }

    /**
    * @param {(value: element, key: identifier, index: number, self: Array) => boolean} predicate 
    */
    countWhere(predicate) {
        const result = 0;
        const self = this._order.map(key => this._values.get(key));
        for (let index = 0; index < self.length; index++) {
            const element = self[index];
            if (predicate(element, element[this.identifier], index, self)) {
                result++;
            }
        }
        return result;
    }

    /**
    * @param {(a, b) => number} predicate 
    */
    sort(predicate) {
        this._order = this.values()
            .sort(predicate)
            .map(value => value[this.identifier]);
    }

    clear() {
        const previous = this.copy();
        this._order.splice(0, this._order.length);
        this._values.clear();
        return previous;
    }

    deleteKey(...keys) {
        this._order = this._order.filter(key => !keys.includes(key))
        return super.deleteKey(...keys);
    }

    deleteAt(...index) {
        return this.deleteKey(...index.map(i => this._order[i]));
    }

    asCollection() {
        return new Collection(
            this.identifier,
            this.values()
        )
    }
}

class CollectionOrder extends CollectionIndex {
    /**
     * @param {(a, b) => number} comparator 
     */
    constructor(identifier, comparator, initialValues) {
        super(identifier);
        this._comparator = comparator;
        if (initialValues) {
            this.set(...initialValues);
        }
    }

    copy(start, end) {
        return new CollectionOrder(
            this.identifier,
            this._comparator,
            this._order
                .slice(start, end)
                .map(key => this._values.get(key))
        );
    }

    /**
     * @param {(value: element, key: identifier, index: number, self: Array) => boolean} predicate 
     */
    where(predicate) {
        const result = [];
        const self = this._order.map(key => this._values.get(key));
        for (let index = 0; index < self.length; index++) {
            const element = self[index];
            if (predicate(element, element[this.identifier], index, self)) {
                result.push(element);
            }
        }
        return new CollectionOrder(this.identifier, this._comparator, result);
    }

    cut(start, end) {
        return new CollectionOrder(
            this.identifier,
            this._comparator,
            this._order
                .splice(start, end)
                .map(key => this._values.get(key))
        );
    }

    set(...values) {
        for (const value of values) {
            const key = value[this.identifier];
            this._values.set(key, value);
            this._order.push(key);
        }
        this.sort();
    }

    /**
     * This enforces the set of custom index out of sort
     */
    setAt(index, ...values) {
        super.setAt(index, ...values);
    }

    /**
     * This will modifiy the further way to sort elements
    * @param {(a, b) => number} predicate 
    */
    sort(predicate) {
        this._order = this.values()
            .sort(predicate ?? this._comparator)
            .map(value => value[this.identifier]);
        if(predicate) {
            this._comparator = predicate;
        }
    }

    asIndex() {
        return new CollectionIndex(
            this.identifier,
            this.values()
        );
    }
}