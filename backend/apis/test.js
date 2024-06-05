import axios from "axios";
import Chart from 'chart.js/auto';
import fs from 'fs';
import express from "express";

export const router = express.Router();

import { testCase1Postgres, testCase2Postgres, testCase3Postgres, testCase4Postgres, testCase5Postgres, testCase6Postgres, testCase7Postgres, testCase8Postgres, testCase9Postgres } from './postgres.js';
import { testCase1Mongo, testCase2Mongo, testCase3Mongo, testCase4Mongo, testCase5Mongo, testCase6Mongo, testCase7Mongo, testCase8Mongo, testCase9Mongo } from "./mongodb.js";
import { testCase1MySQL, testCase2MySQL, testCase3MySQL, testCase4MySQL, testCase5MySQL, testCase6MySQL, testCase7MySQL, testCase8MySQL, testCase9MySQL } from "./mysql.js";
import { testCase1Redis, testCase2Redis, testCase3Redis, testCase4Redis, testCase5Redis, testCase6Redis, testCase7Redis, testCase8Redis, testCase9Redis } from "./redis.js"

const executionTimes = {
    postgres: {},
    mongodb: {},
    mysql: {},
    redis: {}
};


async function executeTestCase(database, testCase) {
    // Check if the database key exists in executionTimes, if not, initialize it
    if (!executionTimes[database]) {
        executionTimes[database] = {};
    }

    // Check if the test case key exists in the database object, if not, initialize it as an empty array
    if (!executionTimes[database][testCase.name]) {
        executionTimes[database][testCase.name] = [];
    }

    const startTime = Date.now();
    await testCase();
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    executionTimes[database][testCase.name].push(executionTime);
}

async function runTestCases() {
    const numberOfTests = 3;

    for (let i = 0; i < numberOfTests; i++) {
        console.log(`Running Test ${i + 1}`);

        await executeTestCase('postgres', testCase1Postgres);
        await executeTestCase('postgres', testCase2Postgres);
        await executeTestCase('postgres', testCase3Postgres);
        await executeTestCase('postgres', testCase4Postgres);
        await executeTestCase('postgres', testCase5Postgres);
        await executeTestCase('postgres', testCase6Postgres);
        await executeTestCase('postgres', testCase7Postgres);
        await executeTestCase('postgres', testCase8Postgres);
        await executeTestCase('postgres', testCase9Postgres);

        await executeTestCase('mongo', testCase1Mongo);
        await executeTestCase('mongo', testCase2Mongo);
        await executeTestCase('mongo', testCase3Mongo);
        await executeTestCase('mongo', testCase4Mongo);
        await executeTestCase('mongo', testCase5Mongo);
        await executeTestCase('mongo', testCase6Mongo);
        await executeTestCase('mongo', testCase7Mongo);
        await executeTestCase('mongo', testCase8Mongo);
        await executeTestCase('mongo', testCase9Mongo);

        // await executeTestCase('mysql', testCase1MySQL);
        // await executeTestCase('mysql', testCase2MySQL);
        // await executeTestCase('mysql', testCase3MySQL);
        // await executeTestCase('mysql', testCase4MySQL);
        // await executeTestCase('mysql', testCase5MySQL);
        // await executeTestCase('mysql', testCase6MySQL);
        // await executeTestCase('mysql', testCase7MySQL);
        // await executeTestCase('mysql', testCase8MySQL);
        // await executeTestCase('mysql', testCase9MySQL);

        await executeTestCase('redis', testCase1Redis);
        await executeTestCase('redis', testCase2Redis);
        await executeTestCase('redis', testCase3Redis);
        await executeTestCase('redis', testCase4Redis);
        await executeTestCase('redis', testCase5Redis);
        await executeTestCase('redis', testCase6Redis);
        await executeTestCase('redis', testCase7Redis);
        await executeTestCase('redis', testCase8Redis);
        // await executeTestCase('redis', testCase9Redis);

    }
    // Calculate the average execution time per test case for each database
    const averageExecutionTimes = {};
    for (const database in executionTimes) {
        averageExecutionTimes[database] = {};
        for (const testCaseName in executionTimes[database]) {
            const times = executionTimes[database][testCaseName];
            const totalExecutionTime = times.reduce((acc, curr) => acc + curr, 0);
            const averageExecutionTime = totalExecutionTime / times.length;
            averageExecutionTimes[database][testCaseName] = averageExecutionTime;
        }
    }

    console.log('Execution Times:', executionTimes);
    console.log('Average Execution Times:', averageExecutionTimes);
    fs.writeFileSync('averageExecutionTimes.json', JSON.stringify(averageExecutionTimes));
}

export default runTestCases

runTestCases();