var Rx = require('rx'),
    _ = require('lodash');

function receiveMessage(sqs, params, callback) {
    sqs.receiveMessage(params, function (err, data) {
        callback(err, data);
        receiveMessage(sqs, params, callback);
    });
}

exports.observerFromQueue = function (sqs, params) {
    return Rx.Observer.create(function (messageParams) {
        sqs.sendMessage(_.defaults(messageParams, params), function (err, data) {

        });
    });
};

exports.observableFromQueue = function (sqs, params) {
    return Rx.Observable.create(function (observer) {
        receiveMessage(sqs, params, function (err, data) {

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
