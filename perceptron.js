/*
*   This is an implementation of Perceptron linear classifier using only Node.js built-in modules.
*   It also assumes that our data labels are the last ones in each sample.
*   This to me was both an attempt in strengthening my knowledge of Promises in JS and AI basics.
*/

const readline = require('node:readline/promises');
const fs = require('node:fs/promises');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const getUserInput = async question => await rl.question(question + ': ');

const generateWeightsVector = numberOfFeatures => {
    let weightsVector = [];
    for (let i = 0; i < numberOfFeatures; i++) weightsVector.push(Math.random());
    return weightsVector;
};

const sgn = z => z >= 0 ? 1 : -1;

const perceptron = async () => {
    const data = JSON.parse(await fs.readFile('iris.json'));
    let iterations = parseInt(await getUserInput('number of iterations'), 10);

    // let bias = parseFloat(await getUserInput('bias'));
    // trial and error shows 0.001 would be an appropriate bias
    let bias = 0.001;
    const weightsVector = generateWeightsVector(data[0].length - 2);
    weightsVector.unshift(bias);
    console.log('This is your initial weights vector', weightsVector);

    let z = 0;

    // const learningRate = parseFloat(await getUserInput('learning rate'));
    // although you can choose this yourself, through trial and error I have come up with the appropriate appropriate learning rate for this dataset
    const learningRate = 0.0001;

    const deltaW = (correctLabel, outputLabel, currentFeature) => learningRate * (correctLabel - outputLabel) * currentFeature;
    
    for (let i = 0; i < iterations; i++) {
        for (const sample of data) {
            for (let i = 0; i < sample.length - 2; i++) z += sample[i] * weightsVector[i];

            const phi = sgn(z);

            if (phi !== sample[sample.length - 1])
                for (let i = 0; i < sample.length - 2; i++) {
                    console.log(deltaW(sample[sample.length - 1], phi, sample[i]), phi);
                    newWeightsVector = weightsVector.map(weight => deltaW(sample[sample.length - 1], phi, sample[i]));
                    weightsVector.forEach((weight, index) => weightsVector[index] += newWeightsVector[index]);
                }

            z = 0;
        }
    }
    const writeData = JSON.stringify(weightsVector);
    await fs.writeFile('weights.json', writeData);
    rl.close();
};

const guess = async sample => {
    const weights = JSON.parse(await fs.readFile('weights.json'));

    let z = 0;

    for (let i = 0; i < sample.length - 2; i++) z += sample[i] * weights[i];

    const phi = sgn(z);

    if (phi === sample[sample.length - 1]) return true;
    else return false;
};

const testDataSet = async () => {
    const data = JSON.parse(await fs.readFile('iris.json'));
    let correct = incorrect = 0;

    for (const sample of data) await guess(sample) === true ? correct++ : incorrect++;
    
    rl.close();

    return { correct, incorrect };
};

const start = async () => {
    switch (process.argv[2]) {
        case '1':
            perceptron();
            break;
        case '2':
            console.log(guess([ 1, 5.1, 3.5, 1.4, 0.2, 1 ]));
            break;
        case '3':
            console.log(await testDataSet());
            break;
        default:
            console.log(await testDataSet());
            break;
    }
};

start();

