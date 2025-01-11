import { processWork } from 'korbit-tutorial-4722fb770e12e4e6/util.js';

function doSomeWork(workToBeDone) {
    let finishedWork = []
    workToBeDone.forEach((workItem) => finishedWork.push(processWork(workItem)))
    return finishedWork
}

let workToBeDone = ["these", "are", "some", "words", null]
console.log(doSomeWork(workToBeDone))