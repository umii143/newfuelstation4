const { execSync } = require('child_process');
try {
    const result = execSync('npx vitest run src/tests/business-unit-isolation.test.ts', {
        stdio: 'pipe',
    });
    console.log('SUCCESS:', result.toString());
} catch (e) {
    console.error('ERROR:', e.stdout ? e.stdout.toString() : e.message);
}
