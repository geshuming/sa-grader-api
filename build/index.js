#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml2js_1 = require("xml2js");
const xmlParser_1 = require("./xmlParser");
const fs = require("fs");
const program = require("commander");
require('dotenv').config();
program
    .usage('[options] <xmlfile>')
    .arguments('<file>')
    .option('-t, --task <n>', 'the task number to be tested')
    .option('-c, --code <file>', 'the student code to be tested')
    .parse(process.argv);
if (!program.args[0]) {
    console.error('Error: Missing XML File!');
    process.exit(1);
}
const assessmentXML = program.args[0];
var assessment;
xml2js_1.parseString(fs.readFileSync(assessmentXML, 'utf8'), (err, result) => {
    if (err)
        throw err;
    console.log('Successfully parsed XML');
    // console.log(JSON.stringify(result, null, " "))
    assessment = xmlParser_1.makeEntireAssessment(result);
});
var questions = assessment[1].questions;
if (program.task) {
    questions = [questions[program.task - 1]];
}
questions = questions.filter((question) => question["type"] === "programming");
function assess(question) {
    const prepend = question.prepend;
    // const studentcode = fs.readFileSync(studentProg, 'utf8') as string
    var solution;
    if (program.code)
        solution = fs.readFileSync(program.code, 'utf8');
    else
        solution = question.solutionTemplate;
    // console.log(solution)
    const postpend = question.postpend;
    var testcases = question.testcases.PUBLIC.map(function (arr) {
        return {
            program: arr._,
            answer: arr.$.answer,
            score: parseInt(arr.$.score, 10)
        };
    });
    testcases = testcases.concat(question.testcases.PRIVATE.map(function (arr) {
        return {
            program: arr._,
            answer: arr.$.answer,
            score: parseInt(arr.$.score, 10)
        };
    }));
    // const testcase = 'quicksort(list(19, 22, 34, 56, 98,1));'
    // const answer = '[1,[19,[22,[34,[56,[98,[]]]]]]]'
    const lambdaLocal = require('lambda-local');
    const event = {
        library: question["library"],
        prependProgram: prepend,
        studentProgram: solution,
        postpendProgram: postpend,
        testCases: testcases
    };
    // console.log("Payload: \n" + JSON.stringify(event, null, " "))
    return lambdaLocal.execute({
        event: event,
        lambdaPath: process.env.GRADERPATH,
        lambdaHandler: 'handler',
        environment: {
            TIMEOUT: 3000
        },
        timeoutMs: 3000,
        verboseLevel: 0
        // callback: function(err, data) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         //console.log(JSON.stringify(data, null, " "));
        //         result = data;
        //     }
        // }
    });
}
var results = questions.map(question => assess(question));
Promise.all(results).then(result => {
    var taskno = program.task ? program.task : 1;
    result.forEach(function (result) {
        console.log("--------------------- TASK " + taskno + " ---------------------");
        taskno++;
        console.log("Total Score: " + result.totalScore);
        const resultReports = result.results;
        var testnumber = 1;
        resultReports.forEach(result => {
            console.log("\nTest Case " + testnumber + ":");
            testnumber++;
            console.log(JSON.stringify(result, null, " "));
        });
        // console.log(JSON.stringify(result, null, " "))
    });
});
//# sourceMappingURL=index.js.map