import { parseString } from 'xml2js'
import { makeEntireAssessment } from './xmlParser'
import { IXmlParseStrProblem } from './xmlParserStrShapes'
import * as fs from 'fs'


if (process.argv.length !== 4) {
    console.error('Exactly two arguments required');
    process.exit(1);
}

const assessmentXML = process.argv[2];
var studentProg = process.argv[3];

var assessment
parseString(fs.readFileSync(assessmentXML, 'utf8'), (err, result) => {
    if (err) throw err
    assessment = makeEntireAssessment(result)
    console.log('Successfully parsed XML')
    // console.log(JSON.stringify(result, null, " "))
})

var questions: Array<IXmlParseStrProblem> = assessment[1].questions

questions = questions.filter((question) => question["type"] === "programming")

if (questions.length >= 1) {
    const question = questions[0]
    const prepend = ''
    const studentcode = fs.readFileSync(studentProg, 'utf8') as string
    const postpend = ''
    const testcase = 'quicksort(list(19, 22, 34, 56, 98,1));'
    const answer = '[1,[19,[22,[34,[56,[98,[]]]]]]]'
    
    const lambdaLocal = require('lambda-local')
    const event = {
        library: question["library"],
        prependProgram: prepend,
        studentProgram: studentcode,
        postpendProgram: postpend,
        testCases: [
            {
                program: testcase,
                answer: answer,
                score: 1
            }
        ]
    }

    // console.log("Payload: \n" + JSON.stringify(event, null, " "))

    lambdaLocal.execute({
        event: event,
        lambdaPath: '../grader/build/',
        lambdaHandler: 'handler',
        environment: {
            TIMEOUT: 3000
        },
        timeoutMs: 3000,
        verboseLevel: 0,
        callback: function(err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log(JSON.stringify(data, null, " "));
            }
        }
    })
}