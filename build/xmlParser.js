"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assessmentShape_1 = require("./assessmentShape");
const editingId = -1;
const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
exports.makeEntireAssessment = (result) => {
    const assessmentArr = makeAssessment(result);
    const overview = makeAssessmentOverview(result, assessmentArr[1], assessmentArr[2]);
    return [overview, assessmentArr[0]];
};
const makeAssessmentOverview = (result, maxGradeVal, maxXpVal) => {
    const task = result.TASK;
    const rawOverview = task.$;
    return {
        category: capitalizeFirstLetter(rawOverview.kind),
        closeAt: rawOverview.duedate,
        coverImage: rawOverview.coverimage,
        grade: 1,
        id: editingId,
        maxGrade: maxGradeVal,
        maxXp: maxXpVal,
        openAt: rawOverview.startdate,
        title: rawOverview.title,
        shortSummary: task.WEBSUMMARY ? task.WEBSUMMARY[0] : '',
        status: assessmentShape_1.AssessmentStatuses.attempting,
        story: rawOverview.story,
        xp: 0,
        gradingStatus: 'none'
    };
};
const makeAssessment = (result) => {
    const task = result.TASK;
    const rawOverview = task.$;
    const questionArr = makeQuestions(task);
    return [
        {
            category: capitalizeFirstLetter(rawOverview.kind),
            id: editingId,
            graderDeployment: task.GRADERDEPLOYMENT[0],
            longSummary: task.TEXT[0],
            missionPDF: 'google.com',
            questions: questionArr[0],
            title: rawOverview.title
        },
        questionArr[1],
        questionArr[2]
    ];
};
const altEval = (str) => {
    return Function('"use strict";return (' + str + ')')();
};
const makeLibrary = (deployment) => {
    const external = deployment.EXTERNAL;
    const nameVal = external ?
        external[0].$.name
        : 'NONE';
    const symbolsVal = external ?
        external[0].SYMBOL
        : [];
    const globalsVal = deployment.GLOBAL ?
        deployment.GLOBAL.map((x) => [x.IDENTIFIER[0], altEval(x.VALUE[0]), x.VALUE[0]])
        : [];
    return {
        chapter: parseInt(deployment.$.interpreter, 10),
        external: {
            name: nameVal,
            symbols: symbolsVal
        },
        globals: globalsVal,
    };
};
const makeQuestions = (task) => {
    const libraryVal = makeLibrary(task.DEPLOYMENT[0]);
    let maxGrade = 0;
    let maxXp = 0;
    const questions = [];
    task.PROBLEMS[0].PROBLEM.forEach((problem, curId) => {
        const localMaxXp = problem.$.maxxp ? parseInt(problem.$.maxxp, 10) : 0;
        const question = {
            answer: null,
            comment: null,
            content: problem.TEXT[0],
            id: curId,
            library: libraryVal,
            type: problem.$.type,
            grader: {
                name: 'fake person',
                id: 1
            },
            gradedAt: '2038-06-18T05:24:26.026Z',
            xp: 0,
            grade: 0,
            maxGrade: parseInt(problem.$.maxgrade, 10),
            maxXp: localMaxXp
        };
        maxGrade += parseInt(problem.$.maxgrade, 10);
        maxXp += localMaxXp;
        if (question.type === 'programming') {
            questions.push(makeProgramming(problem, question));
        }
        if (question.type === 'mcq') {
            questions.push(makeMCQ(problem, question));
        }
    });
    return [questions, maxGrade, maxXp];
};
const makeMCQ = (problem, question) => {
    const choicesVal = [];
    let solutionVal = 0;
    problem.CHOICE.forEach((choice, i) => {
        choicesVal.push({
            content: choice.TEXT[0],
            hint: null
        });
        solutionVal = choice.$.correct === 'true' ? i : solutionVal;
    });
    return Object.assign({}, question, { type: "mcq", answer: parseInt(problem.SNIPPET[0].SOLUTION[0], 10), choices: choicesVal, solution: solutionVal });
};
const makeProgramming = (problem, question) => {
    const result = Object.assign({}, question, { prepend: problem.SNIPPET[0].PREPEND[0], template: problem.SNIPPET[0].TEMPLATE[0], postpend: problem.SNIPPET[0].POSTPEND[0], solutionTemplate: problem.SNIPPET[0].SOLUTION[0], testcases: problem.SNIPPET[0].TESTCASES[0], type: "programming" });
    return result;
};
//# sourceMappingURL=xmlParser.js.map