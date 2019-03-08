import { parseString } from 'xml2js'
import { makeEntireAssessment } from './xmlParser'
import * as fs from 'fs'
import { IProgrammingQuestion } from './assessmentShape';


if (process.argv.length !== 3) {
    console.error('Exactly two arguments required');
    process.exit(1);
}

const assessmentXML = process.argv[2];

var assessment
parseString(fs.readFileSync(assessmentXML, 'utf8'), (err, result) => {
    if (err) throw err
    console.log('Successfully parsed XML')
    //console.log(JSON.stringify(result, null, " "))
    assessment = makeEntireAssessment(result)
})

var questions: Array<IProgrammingQuestion> = assessment[1].questions

questions = questions.filter((question) => question["type"] === "programming")

function assess(question) {
    const prepend = question.prepend!
    // const studentcode = fs.readFileSync(studentProg, 'utf8') as string
    const solution = question.solutionTemplate
    const postpend = question.postpend!
    var testcases = question.testcases.PUBLIC.map(function (arr) {
        return {
            program: arr._,
            answer: arr.$.answer,
            score: parseInt(arr.$.score,10)
        }
    }) as Array<String>
    testcases = testcases.concat(
        question.testcases.PRIVATE.map(function (arr) {
        return {
            program: arr._,
            answer: arr.$.answer,
            score: parseInt(arr.$.score,10)
        }
    }))

    // const testcase = 'quicksort(list(19, 22, 34, 56, 98,1));'
    // const answer = '[1,[19,[22,[34,[56,[98,[]]]]]]]'

    const lambdaLocal = require('lambda-local')
    const event = {
        library: question["library"],
        prependProgram: prepend,
        studentProgram: solution,
        postpendProgram: postpend,
        testCases: testcases
    }

    // console.log("Payload: \n" + JSON.stringify(event, null, " "))
    return lambdaLocal.execute({
        event: event,
        lambdaPath: '../grader/build/',
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
    })
}

var results: Promise<any>[] = questions.map(question => assess(question))
Promise.all(results).then(result => 
{
    var taskno = 1
    result.forEach(function(result) {
            console.log("--------------------- TASK " + taskno + " ---------------------")
            taskno ++
            console.log("Total Score: " + result.totalScore)
            const resultReports = result.results
            var testnumber = 1
            resultReports.forEach(result =>
                {
                    console.log("\nTest Case " + testnumber + ":")
                    testnumber ++
                    console.log(JSON.stringify(result, null, " "))
                })
            // console.log(JSON.stringify(result, null, " "))
    })
}
)
