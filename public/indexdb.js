const { response } = require("express");

let db;

const request = indexedDB.open('transactions', 1);

request.onupgradeneeded = function (e) {
    db = e.target.result;

    if(db.ObjectStoreNames.length === 0) {
    db.createObjectStore('transactions', { autoIncrement: true});

    }

};

request.onsuccess = function(e) {
    db = e.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

const saveInput = (input) => {
    console.log('Saving to IndexDB');

    const transaction = db.transaction(['transactions'], 'readwrite');
    transaction.ObjectStore('transactions').add(input);
}

function checkDatabase() {
    let transaction = db.transaction(['transactions'], 'readwrite');
    let store = transaction.ObjectStore('transactions');
    let getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'applications/json',
                },
            })
            .then(response => response.json())
            .then (() => {
                const transaction = db.transaction(['transactions'], 'readwrite');
                const store = transaction.ObjectStore('transactions')
                store.clear()
            })
        }
    };
    
    getAll.onerror = () => {
        displayActionFailure(this.error);
    }

};

window.addEventListener('online', checkDatabase)
