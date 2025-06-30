import {execSync} from 'node:child_process'
import {existsSync, mkdtempSync, rmSync, cpSync} from 'node:fs'
import {join} from 'node:path'
import {spawn} from 'node:child_process'
import {chromium} from '@playwright/test'
import {setTimeout as wait} from 'node:timers/promises'
import {tmpdir} from 'node:os'
import {PACKAGE_MANAGER, TestResult, TestConfig} from './const'
import {Socket} from 'node:net'

// Helper function to get pnpm home directory
function getPnpmHome(): string {
    try {
        // Try to get pnpm home using 'pnpm config get global-dir'
        const result = execSync('pnpm config get global-dir', { encoding: 'utf8' }).trim()
        return result
    } catch (error) {
        throw error
    }
}

// Helper functions
export async function setupNodeVersion(version: string): Promise<void> {
    console.log(`Setting up Node.js version ${version}...`)
    execSync(`n install ${version} && n use ${version}`, {
        stdio: 'inherit',
        shell: '/bin/bash',
    })
}

export async function setupPackageManager(pm: typeof PACKAGE_MANAGER[0]): Promise<void> {
    console.log(`Setting up package manager: ${pm.name}...`)
    try {
        execSync(`${pm.name === 'npx' ? 'npm' : pm.name} --version`, {stdio: 'pipe'})
    } catch {
        console.log(`Installing ${pm.name}...`)
        if (pm.name === 'pnpm') {
            execSync('npm install -g pnpm', {stdio: 'inherit'})
        } else if (pm.name === 'yarn') {
            execSync('npm install -g yarn', {stdio: 'inherit'})
        } else if (pm.name === 'bun') {
            execSync('npm install -g bun', {stdio: 'inherit'})
        }
    }
}

export async function installCLI(pm: typeof PACKAGE_MANAGER[0]): Promise<void> {
    console.log(`Installing XYD CLI with ${pm.name}...`)
    if (pm.name !== 'npx' && pm.install) {
        // Set up environment with package manager specific configs
        const env: NodeJS.ProcessEnv = {
            ...process.env,
        }
        
        // Handle pnpm global bin directory
        if (pm.name === 'pnpm') {
            fixPnpm(env)
        }

        execSync(pm.install, {
            stdio: 'inherit',
            env
        })
    }
}

function fixPnpm(env: NodeJS.ProcessEnv) {
    try {
        // First try to run pnpm setup to ensure global bin is configured
        execSync('pnpm setup', { stdio: 'pipe', env })
        console.log('✅ pnpm setup completed')
        return
    } catch (error) {
        console.log('⚠️ pnpm setup failed, continuing with manual config')
    }
    
    const pnpmHome = getPnpmHome()
    env.PNPM_HOME = pnpmHome
    env.PATH = `${pnpmHome}:${env.PATH || ''}`
    console.log(`🔧 Set PNPM_HOME to: ${pnpmHome}`)
}

export function createTempWorkspace(testConfig: TestConfig): string {
    const tempDir = mkdtempSync(join(tmpdir(), `xyd-test-${testConfig.name}-`))
    console.log(`📁 Created temporary workspace: ${tempDir}`)

    // Copy template directory to temporary location, ignoring .xyd folder
    cpSync(testConfig.templateDir, tempDir, {
        recursive: true,
        filter: (src, dest) => {
            // Ignore .xyd folder and its contents
            if (src.includes('.xyd')) {
                return false
            }
            return true
        }
    })
    console.log(`📋 Copied template from ${testConfig.templateDir} to ${tempDir} (ignoring .xyd folder)`)

    return tempDir
}

export function cleanupTempWorkspace(tempDir: string): void {
    try {
        rmSync(tempDir, {recursive: true, force: true})
        console.log(`🧹 Cleaned up temporary workspace: ${tempDir}`)
    } catch (error) {
        console.warn(`⚠️ Failed to cleanup temporary workspace ${tempDir}:`, error)
    }
}

export async function testBuild(pm: typeof PACKAGE_MANAGER[0], testConfig: TestConfig, tempDir: string): Promise<boolean> {
    console.log(`Testing build command with ${pm.name} for config: ${testConfig.name}...`)
    console.log("TEMP_DIR", tempDir)
    execSync(`${pm.use} build`, {
        cwd: tempDir, stdio: 'inherit', env: {
            ...process.env,
        }
    })

    const buildDir = join(tempDir, '.xyd', 'build', 'client')
    return existsSync(buildDir)
}

export async function setupWorkspace(nodeVersion: string, pm: typeof PACKAGE_MANAGER[0]) {
    if (process.env.SETUP_WORKSPACE === 'false') {
        console.log('Stop setupWorkspace setup')
        return
    }

    await setupNodeVersion(nodeVersion)
    await setupPackageManager(pm)
    await installCLI(pm)
}

export async function testDevServer(pm: typeof PACKAGE_MANAGER[0], testConfig: TestConfig, tempDir: string): Promise<boolean> {
    console.log(`Testing dev server with ${pm.name} for config: ${testConfig.name}...`)
    const port = 3000 + Math.floor(Math.random() * 1000)

    const server = spawn(pm.use, ['dev', '--port', port.toString()], {
        cwd: tempDir,
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
        },
    }) as any

    let browser: any = null

    try {
        const serverStarted = await waitForServer(port, 1000 * 60 * 5)
        
        if (!serverStarted) {
            throw new Error(`Server failed to start on port ${port} within 2 minutes`)
        }

        browser = await chromium.launch()
        const page = await browser.newPage()

        // Test each configured page
        for (const pageTest of testConfig.pages) {
            const url = `http://localhost:${port}${pageTest.path}`
            console.log(`🔍 Testing page: ${url}`)

            const response = await page.goto(url)
            await page.waitForLoadState('networkidle')
            if (!response) {
                throw new Error(`No response received for ${pageTest.path}`)
            }

            const status = response.status()
            if (status < 200 || status >= 400) {
                throw new Error(`Page ${pageTest.path} returned bad status code: ${status}`)
            }

            console.log(`✅ Page ${pageTest.path} passed validation`)
        }

        return true
    } finally {
        // Clean up resources
        if (browser) {
            await browser.close()
        }

        // Kill the server process with proper signal handling
        if (server && !server.killed) {
            try {
                server.kill('SIGTERM')
                // Give it a moment to terminate gracefully
                await wait(1000)

                // If still running, force kill
                if (!server.killed) {
                    server.kill('SIGKILL')
                }
            } catch (error) {
                console.warn('Error killing server process:', error)
            }
        }
    }
}

export async function testBuiltPages(pm: typeof PACKAGE_MANAGER[0], testConfig: TestConfig, tempDir: string): Promise<boolean> {
    console.log(`Testing built pages with ${pm.name} for config: ${testConfig.name}...`)

    const buildDir = join(tempDir, '.xyd', 'build', 'client')

    // Start a simple HTTP server to serve the built files
    const port = 4000 + Math.floor(Math.random() * 1000)
    console.log(`🚀 Starting serve on port ${port}...`)

    const server = spawn('npx', ['serve', '-s', buildDir, '-p', port.toString()], {
        stdio: 'pipe',
        shell: true,
        detached: false, // Ensure the process is not detached
    }) as any

    let browser: any = null

    try {
        const serverStarted = await waitForServer(port, 1000 * 60 * 5)
        
        if (!serverStarted) {
            throw new Error(`Server failed to start on port ${port} within 2 minutes`)
        }

        browser = await chromium.launch()
        const page = await browser.newPage()

        // Test each configured page for good status codes
        for (const pageTest of testConfig.pages) {
            const url = `http://localhost:${port}${pageTest.path}`
            console.log(`🔍 Testing built page: ${url}`)

            const response = await page.goto(url)

            // Check if the page returns a good status code (2xx or 3xx)
            if (!response) {
                throw new Error(`No response received for ${pageTest.path}`)
            }

            const status = response.status()
            if (status < 200 || status >= 400) {
                throw new Error(`Page ${pageTest.path} returned bad status code: ${status}`)
            }

            console.log(`✅ Page ${pageTest.path} returned good status code: ${status}`)
        }

        console.log(`✅ All pages tested successfully`)
        return true
    } finally {
        console.log(`🧹 Cleaning up resources...`)

        // Clean up resources
        if (browser) {
            console.log(`🔒 Closing browser...`)
            await browser.close()
            console.log(`✅ Browser closed`)
        }

        // Kill the server process with proper signal handling
        if (server && !server.killed) {
            console.log(`🛑 Killing server process (PID: ${server.pid})...`)
            try {
                // First try graceful termination
                server.kill('SIGTERM')
                console.log(`📤 Sent SIGTERM to server process`)

                // Give it a moment to terminate gracefully
                await wait(2000)

                // If still running, force kill
                if (!server.killed) {
                    console.log(`💀 Force killing server process...`)
                    server.kill('SIGKILL')
                    await wait(1000)
                }

                console.log(`✅ Server process terminated`)
            } catch (error) {
                console.warn('⚠️ Error killing server process:', error)
            }
        } else {
            console.log(`ℹ️ Server process already killed or not running`)
        }
    }
}

export function resultSummary(testResults: TestResult[]) {
    console.log('\n=== Test Results Summary ===')
    testResults.forEach(result => {
        const status = result.success ? '✅' : '❌'
        console.log(`${status} Node ${result.nodeVersion} + ${result.packageManager} (${result.testType}) - ${result.testConfig}: ${result.error || 'Passed'}`)
    })

    const failedTests = testResults.filter(r => !r.success)
    if (failedTests.length > 0) {
        console.error(`\n❌ ${failedTests.length} test(s) failed`)
    } else {
        console.log('\n🎉 All tests passed!')
    }
}

// Helper function to check if server is running on a port
async function isServerRunning(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new Socket()
        
        socket.setTimeout(1000) // 1 second timeout
        
        socket.on('connect', () => {
            socket.destroy()
            resolve(true)
        })
        
        socket.on('timeout', () => {
            socket.destroy()
            resolve(false)
        })
        
        socket.on('error', () => {
            socket.destroy()
            resolve(false)
        })
        
        socket.connect(port, 'localhost')
    })
}

// Helper function to wait for server to start with timeout
async function waitForServer(port: number, maxWaitTime: number = 120000): Promise<boolean> {
    const startTime = Date.now()
    const checkInterval = 1000 * 5 // 5 seconds
    
    console.log(`⏳ Waiting for server to start on port ${port}...`)
    
    while (Date.now() - startTime < maxWaitTime) {
        if (await isServerRunning(port)) {
            console.log(`✅ Server is running on port ${port}`)
            return true
        }
        
        console.log(`⏳ Server not ready yet, waiting ${checkInterval}ms...`)
        await wait(checkInterval)
    }
    
    console.log(`❌ Server failed to start within ${maxWaitTime / 1000} seconds`)
    return false
}