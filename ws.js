'use strict';

var db, dbName, collectionName, store;

console.log('WW :: Web Worker started');

onmessage = function (evt) {
    console.log('WW :: Received a message from the main thread');
    var msg = evt.data;
    try {
        msg = JSON.parse(msg);
    }
    catch (err) {
        console.error(err);
    }
    console.log('WW ::', msg);

    if (msg.method === 'POST' && msg.url === '/databases' && msg.data.name.length > 0) {
        console.log('WW :: POST /databases', msg.data.name);
        dbName = msg.data.name;
        var request = indexedDB.open(msg.data.name, 5);

        request.onupgradeneeded = function() {
            // The database did not previously exist, so create object stores and indexes.
            db = request.result;
            /*var store = db.createObjectStore("books", {keyPath: "isbn"});
            var titleIndex = store.createIndex("by_title", "title", {unique: true});
            var authorIndex = store.createIndex("by_author", "author");

            // Populate with initial data.
            store.put({title: "Quarry Memories", author: "Fred", isbn: 123456});
            store.put({title: "Water Buffaloes", author: "Fred", isbn: 234567});
            store.put({title: "Bedrock Nights", author: "Barney", isbn: 345678});*/
        };

        request.onsuccess = function() {
            //db = request.result;

            postMessage(JSON.stringify({
                id: msg.id,
                data: {
                    msg: `database ${msg.data.name} created!`
                }
            }));
        };
    }
    else if (msg.method === 'POST' && msg.url === `/databases/${dbName}/collections` && msg.data.name.length > 0) {
        console.log(`WW :: POST /databases/${dbName}/collections`, msg.data.name);
        collectionName = msg.data.name;
        store = db.createObjectStore("books", {keyPath: "isbn"});
        var titleIndex = store.createIndex("by_title", "title", {unique: true});
        var authorIndex = store.createIndex("by_author", "author");

        store.transaction.oncomplete = function () {
            postMessage(JSON.stringify({
                id: msg.id,
                data: {
                    msg: `collection ${msg.data.name} created!`
                }
            }));
        };
    }
    else if (msg.method === 'POST' && msg.url === `/databases/${dbName}/collections/${collectionName}` && msg.data.title.length > 0) {
        console.log(`WW :: POST /databases/${dbName}/collections/${collectionName}`, msg.data);
        var booksStore = db.transaction("books", "readwrite").objectStore("books");
        booksStore.put(msg.data);
        booksStore.transaction.oncomplete = function () {
            postMessage(JSON.stringify({
                id: msg.id,
                data: {
                    msg: `book ${msg.data.title} created!`
                }
            }));
        };
    }
};