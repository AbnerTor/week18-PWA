
// let db;

// const request = indexedDB.open('transactions', 1);

// request.onupgradeneeded = function (e) {
//     db = e.target.result;

//     if(!db.ObjectStoreNames) {
//     db.createObjectStore('transactions', { autoIncrement: true});

//     }

// };

// request.onsuccess = function(e) {
//     db = e.target.result;
//     if (navigator.onLine) {
//         checkDatabase();
//     }
// };

// const saveInput = (input) => {
//     console.log('Saving to IndexDB');

//     const transaction = db.transaction(['transactions'], 'readwrite');
//     transaction.ObjectStore('transactions').add(input);
// }

// function checkDatabase() {
//     let transaction = db.transaction(['transactions'], 'readwrite');
//     let store = transaction.ObjectStore('transactions');
//     let getAll = store.getAll();

//     getAll.onsuccess = () => {
//         if (getAll.result.length > 0) {
//             fetch('/api/transaction/bulk', {
//                 method: 'POST',
//                 body: JSON.stringify(getAll.result),
//                 headers: {
//                     Accept: 'application/json, text/plain, */*',
//                     'Content-Type': 'applications/json',
//                 },
//             })
//             .then(response => response.json())
//             .then (() => {
//                 const transaction = db.transaction(['transactions'], 'readwrite');
//                 const store = transaction.ObjectStore('transactions')
//                 store.clear()
//             })
//         }
//     };

//     getAll.onerror = () => {
//         displayActionFailure(this.error);
//     }

// };

// window.addEventListener('online', checkDatabase)

let db;
const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;
const request = indexedDB.open("budget", 1);
request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};
request.onsuccess = ({ target }) => {
    db = target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};
request.onerror = function (event) {
    console.log("Woops! " + event.target.errorCode);
};
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
}
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    return response.json();
                })
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}


window.addEventListener("online", checkDatabase);