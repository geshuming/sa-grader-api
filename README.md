# Command Line API for Source Academy Grader

## Installation and Requirements

This API requires [NPM](https://www.npmjs.com/).

Just type ```npm install``` to install the necessary dependencies

Set the `GRADERPATH` option in the `.env` file to point to the grader build.

## Usage

The API uses the SOLUTION node's to test against the test cases by default. If you need to test a student code, use the `-c` flag.

To test your assessment xml file, 

```build/index.js <path-to-xml-file>```

Alternatively, you may want to pipe the output

```build/index.js <path-to-xml-file> > output.txt```

### Options

| option | description |
| --- | --- |
|`-t, --task <number>` | selects the task to test
|`-c, --code <path-to-file>` | selects the student code to test  