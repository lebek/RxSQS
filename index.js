var Rx = require('rx'),
    _ = require('lodash');

function readMessage(sqs, params, callback) {
    sqs.receiveMessage(params, function (err, data) {
        callback(err, data);
        readMessage(sqs, params, callback);
    });
}

exports.observableFromQueue = function (sqs, params) {
    return Rx.Observable.create(function (observer) {
        readMessage(sqs, params, function (err, data) {

            if (err) {
                observer.onError(err);
            } else if (data && data.Messages) {
                _.forEach(data.Messages, function (message) {
                    observer.onNext(message);
                });
            }

            return function () {
                /* Clean up */
            };
        });
    });
};