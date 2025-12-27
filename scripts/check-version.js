const fs = require('fs');
const { execSync } = require('child_process');

try {
    // Read package.json version
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const packageVersion = packageJson.version;

    // Get current git tag
    // GITHUB_REF_NAME env var is usually available in actions, or we can use git command
    let gitTag = process.env.GITHUB_REF_NAME;

    if (!gitTag) {
        console.log('GITHUB_REF_NAME not found, trying git command...');
        gitTag = execSync('git describe --tags --exact-match').toString().trim();
    }

    // Remove 'v' prefix if present
    const cleanTag = gitTag.startsWith('v') ? gitTag.slice(1) : gitTag;

    console.log(`Package Version: ${packageVersion}`);
    console.log(`Git Tag: ${gitTag} (Clean: ${cleanTag})`);

    if (packageVersion !== cleanTag) {
        console.error(`Error: Version mismatch! package.json (${packageVersion}) != tag (${cleanTag})`);
        process.exit(1);
    }

    console.log('Version check passed ✅');
} catch (error) {
    console.error('Version check failed:', error.message);
    process.exit(1);
}
