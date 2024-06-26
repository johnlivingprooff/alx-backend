import { expect } from 'chai';
import kue from 'kue';
import sinon from 'sinon';
import createPushNotificationsJobs from './8-job.js';

describe('createPushNotificationsJobs', () => {
  let queue;

  before(() => {
    queue = kue.createQueue();
    queue.testMode.enter();
  });

  afterEach(() => {
    queue.testMode.clear();
  });

  after(() => {
    queue.testMode.exit();
  });

  it('should throw an error if jobs is not an array', () => {
    expect(() => createPushNotificationsJobs(null, queue)).to.throw('Jobs is not an array');
  });

  it('should create jobs and add them to the queue', () => {
    const jobs = [
      { phoneNumber: '1234567890', message: 'Hello, World!' },
      { phoneNumber: '0987654321', message: 'Goodbye, World!' }
    ];

    createPushNotificationsJobs(jobs, queue);

    expect(queue.testMode.jobs.length).to.equal(2);
    expect(queue.testMode.jobs[0].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[0].data).to.deep.equal(jobs[0]);
    expect(queue.testMode.jobs[1].type).to.equal('push_notification_code_3');
    expect(queue.testMode.jobs[1].data).to.deep.equal(jobs[1]);
  });

  it('should log the correct messages for job events', () => {
    const jobs = [
      { phoneNumber: '1234567890', message: 'Hello, World!' }
    ];

    const consoleSpy = sinon.spy(console, 'log');

    createPushNotificationsJobs(jobs, queue);

    const job = queue.testMode.jobs[0];

    job.emit('enqueue');
    expect(consoleSpy.calledWith(`Notification job created: ${job.id}`)).to.be.true;

    job.emit('complete');
    expect(consoleSpy.calledWith(`Notification job ${job.id} completed`)).to.be.true;

    const error = new Error('Failed to process job');
    job.emit('failed', error);
    expect(consoleSpy.calledWith(`Notification job ${job.id} failed: ${error}`)).to.be.true;

    job.emit('progress', 50);
    expect(consoleSpy.calledWith(`Notification job ${job.id} 50% complete`)).to.be.true;

    consoleSpy.restore();
  });
});
