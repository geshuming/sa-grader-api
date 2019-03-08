"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AssessmentStatuses;
(function (AssessmentStatuses) {
    AssessmentStatuses["not_attempted"] = "not_attempted";
    AssessmentStatuses["attempting"] = "attempting";
    AssessmentStatuses["attempted"] = "attempted";
    AssessmentStatuses["submitted"] = "submitted";
})(AssessmentStatuses = exports.AssessmentStatuses || (exports.AssessmentStatuses = {}));
var GradingStatuses;
(function (GradingStatuses) {
    GradingStatuses["none"] = "none";
    GradingStatuses["grading"] = "grading";
    GradingStatuses["graded"] = "graded";
})(GradingStatuses = exports.GradingStatuses || (exports.GradingStatuses = {}));
/* The different kinds of Assessments available */
var AssessmentCategories;
(function (AssessmentCategories) {
    AssessmentCategories["Contest"] = "Contest";
    AssessmentCategories["Mission"] = "Mission";
    AssessmentCategories["Path"] = "Path";
    AssessmentCategories["Sidequest"] = "Sidequest";
})(AssessmentCategories = exports.AssessmentCategories || (exports.AssessmentCategories = {}));
/* The two kinds of Questions available */
var QuestionTypes;
(function (QuestionTypes) {
    QuestionTypes["programming"] = "programming";
    QuestionTypes["mcq"] = "mcq";
})(QuestionTypes = exports.QuestionTypes || (exports.QuestionTypes = {}));
/** Constants for external library names */
var ExternalLibraryNames;
(function (ExternalLibraryNames) {
    ExternalLibraryNames["NONE"] = "NONE";
    ExternalLibraryNames["TWO_DIM_RUNES"] = "TWO_DIM_RUNES";
    ExternalLibraryNames["THREE_DIM_RUNES"] = "THREE_DIM_RUNES";
    ExternalLibraryNames["CURVES"] = "CURVES";
    ExternalLibraryNames["SOUND"] = "SOUND";
    ExternalLibraryNames["STREAMS"] = "STREAMS";
})(ExternalLibraryNames = exports.ExternalLibraryNames || (exports.ExternalLibraryNames = {}));
//# sourceMappingURL=assessmentShape.js.map