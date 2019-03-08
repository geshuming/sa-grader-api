import {
  AssessmentCategories,
  AssessmentStatuses,
  GradingStatuses,
  IAssessment,
  IAssessmentOverview,
  IMCQQuestion,
  IProgrammingQuestion,
  IQuestion, 
  Library,
  MCQChoice
} from './assessmentShape'
import {
  IXmlParseStrCProblem,
  IXmlParseStrDeployment,
  IXmlParseStrOverview,
  IXmlParseStrPProblem,
  IXmlParseStrProblem,
  IXmlParseStrProblemChoice,
  IXmlParseStrTask
} from './xmlParserStrShapes'; 

const editingId = -1;

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const makeEntireAssessment = (result: any) : [IAssessmentOverview, IAssessment] => {
  const assessmentArr = makeAssessment(result);
  const overview = makeAssessmentOverview(result, assessmentArr[1], assessmentArr[2]);
  return [overview, assessmentArr[0]];
}

const makeAssessmentOverview = (result: any, maxGradeVal: number, maxXpVal: number) : IAssessmentOverview => {
  const task : IXmlParseStrTask = result.TASK;
  const rawOverview : IXmlParseStrOverview = task.$;
  return {
    category: capitalizeFirstLetter(rawOverview.kind) as AssessmentCategories,
    closeAt: rawOverview.duedate,
    coverImage: rawOverview.coverimage,
    grade: 1,
    id: editingId,
    maxGrade: maxGradeVal,
    maxXp: maxXpVal,
    openAt: rawOverview.startdate,
    title: rawOverview.title,
    shortSummary: task.WEBSUMMARY ? task.WEBSUMMARY[0] : '',
    status: AssessmentStatuses.attempting,
    story: rawOverview.story,
    xp: 0,
    gradingStatus: 'none' as GradingStatuses
  }
}

const makeAssessment = (result: any) : [IAssessment, number, number] => {
  const task : IXmlParseStrTask = result.TASK;
  const rawOverview : IXmlParseStrOverview = task.$;
  const questionArr = makeQuestions(task);
  return [
    {
      category: capitalizeFirstLetter(rawOverview.kind) as AssessmentCategories,
      id: editingId,
      graderDeployment: task.GRADERDEPLOYMENT[0],
      longSummary: task.TEXT[0],
      missionPDF: 'google.com',
      questions: questionArr[0],
      title: rawOverview.title
    },
    questionArr[1],
    questionArr[2]
  ]
}

const altEval = (str: string) : any => {
    return str;
}

const makeLibrary = (deployment: IXmlParseStrDeployment) : Library => {
  const external = deployment.EXTERNAL;
  const nameVal = external ? 
    external[0].$.name
    : 'NONE';
  const symbolsVal : string[]  = external ? 
    external[0].SYMBOL 
    : [];
  const globalsVal = deployment.GLOBAL ? 
    deployment.GLOBAL.map((x) => [x.IDENTIFIER[0], altEval(x.VALUE[0]), x.VALUE[0]]) as Array<[string, any, string]>
    : [];
  return {
    chapter: parseInt(deployment.$.interpreter, 10),
    external: {
      name: nameVal,
      symbols: symbolsVal
    },
    globals: globalsVal,
  }
}

const makeQuestions = (task: IXmlParseStrTask) : [IQuestion[], number, number] => {
  const libraryVal = makeLibrary(task.DEPLOYMENT[0]);
  let maxGrade = 0;
  let maxXp = 0;
  const questions: Array<IProgrammingQuestion | IMCQQuestion> = []
  task.PROBLEMS[0].PROBLEM.forEach((problem: IXmlParseStrProblem, curId: number) => {
    const localMaxXp = problem.$.maxxp ? parseInt(problem.$.maxxp, 10) : 0;
    const question: IQuestion = {
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
    }
    maxGrade += parseInt(problem.$.maxgrade, 10);
    maxXp += localMaxXp;
    if (question.type === 'programming') {
      questions.push(makeProgramming(problem as IXmlParseStrPProblem, question))
    }
    if (question.type === 'mcq') {
      questions.push(makeMCQ(problem as IXmlParseStrCProblem, question));
    }
  })
  return [questions, maxGrade, maxXp];
}

const makeMCQ = (problem: IXmlParseStrCProblem, question: IQuestion) : IMCQQuestion => {
  const choicesVal: MCQChoice[] = []
  let solutionVal = 0
  problem.CHOICE.forEach((choice: IXmlParseStrProblemChoice, i: number) => {
    choicesVal.push({
      content: choice.TEXT[0],
      hint: null
    })
    solutionVal = choice.$.correct === 'true' ? i : solutionVal
  })
  return {
    ...question,
    type: "mcq",
    answer: parseInt(problem.SNIPPET[0].SOLUTION[0], 10),
    choices: choicesVal,
    solution: solutionVal
  }
}

const makeProgramming = (problem: IXmlParseStrPProblem, question: IQuestion): IProgrammingQuestion => {
  const result: IProgrammingQuestion = {
    ...question,
    prepend: problem.SNIPPET[0].PREPEND[0] as string,
    template: problem.SNIPPET[0].TEMPLATE[0] as string,
    postpend: problem.SNIPPET[0].POSTPEND[0] as string,
    solutionTemplate: problem.SNIPPET[0].SOLUTION[0] as string,
    testcases: problem.SNIPPET[0].TESTCASES[0],
    type: "programming"
  }
  return result;
}

