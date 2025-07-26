#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if --prod flag is provided
const isProduction = process.argv.includes('--prod');

// Helper function to run commands
function runCommand(command, description) {
    console.log(`\n🔄 ${description}...\n`);
    try {
        const [cmd, ...args] = command.split(' ');
        const result = spawnSync(cmd, args, {
            stdio: 'inherit',
            shell: true
        });

        if (result.status !== 0) {
            throw new Error(`Command failed with exit code ${result.status}`);
        }
        console.log(`✅ ${description} completed successfully`);
    } catch (error) {
        console.error(`❌ Error during ${description}:`, error.message);
        process.exit(1);
    }
}

// Helper function to create changeset file
function createChangeset(packages, message) {
    const changesetDir = '.changeset';
    const timestamp = Date.now();
    const filename = `release-${timestamp}.md`;
    const filepath = path.join(changesetDir, filename);

    let content = '---\n';
    packages.forEach(pkg => {
        content += `"${pkg}": patch\n`;
    });
    content += '---\n\n';
    content += message;

    fs.writeFileSync(filepath, content);
    console.log(`✅ Created changeset: ${filename}\n`);
}

async function main() {
    console.log('🚀 Starting release process...\n');

    // Step 1: Build
    // runCommand('pnpm run build', 'Building packages');

    {
        // Step 2: Changeset for all CLI dependencies packages
        console.log('🔄 Creating changeset for CLI dependencies packages...');
        createChangeset([
            '@xyd-js/openapi-sampler',
            '@xyd-js/analytics',
            '@xyd-js/atlas',
            '@xyd-js/components',
            '@xyd-js/composer',
            '@xyd-js/content',
            '@xyd-js/context',
            '@xyd-js/core',
            '@xyd-js/documan',
            '@xyd-js/foo',
            '@xyd-js/framework',
            '@xyd-js/gql',
            '@xyd-js/host',
            '@xyd-js/openapi',
            '@xyd-js/plugin-algolia',
            '@xyd-js/plugin-docs',
            '@xyd-js/plugin-orama',
            '@xyd-js/plugins',
            '@xyd-js/sources',
            '@xyd-js/storybook',
            '@xyd-js/theme-cosmo',
            '@xyd-js/theme-gusto',
            '@xyd-js/theme-opener',
            '@xyd-js/theme-picasso',
            '@xyd-js/theme-poetry',
            '@xyd-js/theme-solar',
            '@xyd-js/themes',
            '@xyd-js/ui',
            '@xyd-js/uniform',
        ], 'update all packages');

        // Step 3: Clear npm cache
        runCommand('rm -rf $HOME/.npm/_cacache', 'Clearing npm cache');

        // Step 4: Update all CLI dependencies packages versions
        runCommand('pnpm changeset version', 'Versioning CLI dependencies packages');

        // Step 5: Publish all CLI dependencies packages
        const publishCommand = isProduction 
            ? 'pnpm changeset publish' 
            : 'npm_config_registry=http://localhost:4873 pnpm changeset publish';
        runCommand(publishCommand, 'Publishing packages');
    }

    {
        // Step 6: Create changeset for CLI package
        console.log('🔄 Creating changeset for CLI package...\n');
        createChangeset([
            '@xyd-js/cli'
        ], 'update cli');

        // Step 7: Version packages
        runCommand('pnpm changeset version', 'Versioning packages');

        // Step 8: Publish packages
        const publishCommand = isProduction 
            ? 'pnpm changeset publish' 
            : 'npm_config_registry=http://localhost:4873 pnpm changeset publish';
        runCommand(publishCommand, 'Publishing packages');
    }

    
    if (!isProduction) {
        // TODO: FIX IN THE FUTURE CUZ IT SHOULD BE AUTOMATICALLY DONE BY NPM
        // set latest tags
        runCommand('node set-latest-tags.js', 'Setting latest tags');
    }

    console.log('🎉 Release process completed successfully!\n');
}

main().catch(error => {
    console.error('❌ Release process failed:', error);
    process.exit(1);
}); 