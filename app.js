(function () {
    'use strict';

    window.createDb = function () {
        var dbCreationId = Date.now(),
            booksCreationId, populateId;

        var ws = new Worker('ws.js');

        ws.onmessage = function (evt) {
            console.log('MT :: A message incoming from ws.js');
            var msg = evt.data;
            try {
                msg = JSON.parse(msg);
            }
            catch (err) {
                console.error(err);
            }
            console.log('MT ::', msg);

            if (msg.id === dbCreationId) {
                console.log('MT :: db created! Creating a new books collection');
                console.log('MT ::', msg.data.msg);
                booksCreationId = Date.now();
                ws.postMessage(JSON.stringify({
                    method: 'POST',
                    url: '/databases/test/collections',
                    data: {
                        name: 'books'
                    },
                    id: booksCreationId
                }));
            }
            else if (msg.id === booksCreationId) {
                console.log('MT :: books collection created! Inserting a new book');
                populateId = Date.now();
                ws.postMessage(JSON.stringify({
                    method: 'POST',
                    url: '/databases/test/collections/books',
                    data: {title: "Quarry Memories", author: "Fred", isbn: 123456},
                    id: populateId
                }));
            }
            else if (msg.id === populateId) {
                console.log('MT :: DB populated');
                console.log('MT ::', msg.data.msg);
            }
        };

        ws.postMessage(JSON.stringify({
            method: 'POST',
            url: '/databases',
            data: {
                name: 'test'
            },
            id: dbCreationId
        }));
    };
})();