const mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_TEST_PENDING,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_TEST_END,
} = mocha.Runner.constants;
const fs = require('fs');
const submitted_at = process.env.npm_config_submitted_at;

module.exports = MyReporter;

function MyReporter(runner) {
  mocha.reporters.Base.call(this, runner);

  let passes = 0;
  let failures = 0;
  let ec = 0;

  runner.once(EVENT_RUN_BEGIN, () => {
    setTimeout(() => {
      process.exit(0);
    }, 10000);
  });

  runner.on(EVENT_TEST_PENDING, () => {
    failures++;
  });

  runner.on(EVENT_TEST_PASS, (test) => {
    // calculate extra credit separately
    if (/extra\s?\-?credit/i.test(test.fullTitle())) {
      ec++;
      return;
    }

    passes++;
  });

  runner.on(EVENT_TEST_FAIL, () => {
    failures++;
  });

  runner.on(EVENT_TEST_END, () => {
    let grade;

    // if complete failure and/or non-attempt, assign 0 to avoid NaN from division by zero
    if (!passes || !(passes + failures)) {
      grade = 0;
    } else {
      grade = (((passes + ec) / (passes + failures)) * 100).toFixed(1);
    }

    fs.writeFileSync(
      'grade.json',
      JSON.stringify({
        grade,
        submitted_at: new Date(+submitted_at * 1000).toLocaleString(),
      })
    );
  });
}