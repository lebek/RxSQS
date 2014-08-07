RxSQS
=====

Reactive Extensions for Amazon SQS/SNS + Node.js

```javascript
'use strict';

var AWS = require('aws-sdk'),
    RxSQS = require('rx-sqs'),
    sqs, sns, config, 
    screenshotCompletions,
    screenshotJobs;

AWS.config = {
  /* AWS Credentials/Region */
};

/* SNS/SQS configuration */
config = {
    screenshotQueueUrl: '...',
    screenshotCompletionTopicArn: '...'
};

sqs = new AWS.SQS();
sns = new AWS.SNS();

/* Initialize SNS notification publication observer */
screenshotCompletions = RxSQS.observerFromTopic(sns, {
    'TopicArn' : config.screenshotCompletionTopicArn
});

/* Initialize the sending & recieving end of the SQS queue */
screenshotJobs = RxSQS.subjectFromQueue(sqs, {
    'QueueUrl' : config.screenshotQueueUrl
}, {
    'QueueUrl' : config.screenshotQueueUrl,
    'MaxNumberOfMessages': 1,
    'VisibilityTimeout': 30,
    'WaitTimeSeconds': 20
});

/* Subscribe to our SQS screenshot job queue */
screenshotJobs.subscribe(function (job) {
    console.log(job);
    
    /* Do some work... */
    
    /* Send screenshot completion notification to SNS topic */
    screenshotCompletions.onNext({
        Message: "Completed a screenshot :)"
    });

    /* Remove from the queue */
    sqs.deleteMessage({
        "QueueUrl" : config.screenshotQueueUrl,
        "ReceiptHandle" :job.ReceiptHandle
    }, function(err, data){

    });
});

/* Send a job to our SQS screenshot job queue */
screenshotJobs.onNext({ MessageBody: "Screenshot job" });
```
