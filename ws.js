'use strict';

importScripts('bower_components/dexie/dist/dexie.js');

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
        db = new Dexie(dbName);
        postMessage(JSON.stringify({
            id: msg.id,
            data: {
                msg: `database ${dbName} created!`
            }
        }));

        if (Notification.permission === 'granted') {
            new Notification(`database ${dbName} created!`);
        }
    }
    else if (msg.method === 'POST' && msg.url === `/databases/${dbName}/collections` && msg.data.name.length > 0) {
        console.log(`WW :: POST /databases/${dbName}/collections`, msg.data.name);
        collectionName = msg.data.name;
        var collections = {};
        collections[collectionName] = msg.data.fields.join(', ');
        db.version(1).stores(collections);
        db.open()
            .then(() => {
                postMessage(JSON.stringify({
                    id: msg.id,
                    data: {
                        msg: `collection ${collectionName} created!`
                    }
                }));

                if (Notification.permission === 'granted') {
                    new Notification(`collection ${collectionName} created!`);
                }
            });
    }
    else if (msg.method === 'POST' && msg.url === `/databases/${dbName}/collections/${collectionName}` && msg.data.title.length > 0) {
        console.log(`WW :: POST /databases/${dbName}/collections/${collectionName}`, msg.data);

        db.transaction('rw', collectionName, () => {
            db[collectionName].add(msg.data);

            db[collectionName].where('title').equals(msg.data.title).each(function (document) {
                console.log('WW ::', document);
            });

            console.log('WW :: replying to the MT');

            postMessage(JSON.stringify({
                id: msg.id,
                data: {
                    msg: `book ${msg.data.title} created!`
                }
            }));

            if (Notification.permission === 'granted') {
                new Notification(`book ${msg.data.title} created!`);
            }
        });
    }
};