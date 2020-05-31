const taskLib = require('azure-pipelines-task-lib/task')
const { mkdirSync, writeFileSync } = require('fs')
const { join } = require('path')

const hat = require('hat')

async function run () {
  try {
    const targetType = taskLib.getInput('targetType', true)
    let scriptPath
    if (targetType === 'filePath') {
      const scriptPathInput = taskLib.getInput('scriptPath', true)
      scriptPath = scriptPathInput.startsWith('http') ? scriptPathInput : taskLib.getPathInput('scriptPath', true, true)
    } else {
      const scriptContent = taskLib.getInput('script', true)
      const scriptDir = join(taskLib.getVariable('Agent.TempDirectory'), hat())
      mkdirSync(scriptDir)
      scriptPath = join(scriptDir, 'script.ts')
      writeFileSync(scriptPath, scriptContent)
    }

    const permissions = getPermissions()
    const args = getArguments()
    runScript(scriptPath, args, permissions)
  } catch (error) {
    taskLib.setResult(taskLib.TaskResult.Failed, error.message)
  }
}

function runScript (scriptPath, args, permissions) {
  taskLib.debug('Running script')
  let denoTool
  try {
    denoTool = taskLib.tool(taskLib.which('deno', true))
  } catch (error) {
    throw new Error('Deno is not installed, please run "Download Deno" task before proceeding')
  }

  const execArgsArray = ['run', ...permissions, scriptPath, ...args]
  const cwd = taskLib.getPathInput('cwd', false, true)
  const execOptions = {
    failOnStdErr: false,
    ignoreReturnCode: false,
    windowsVerbatimArguments: true,
    cwd: cwd
  }

  denoTool.arg(execArgsArray)
  const denoProcess = denoTool.execSync(execOptions)
  if (denoProcess.code !== 0) {
    throw new Error('Failed to execute script')
  }
}

function getPermissions () {
  const permissionsInput = taskLib.getInput('permissions', false)
  const permissions = permissionsInput ? permissionsInput.split(/[\n]+/) : []
  return permissions.map(permission => { return permission.trim() })
}

function getArguments () {
  const argsInput = taskLib.getInput('arguments', false)
  const args = argsInput ? argsInput.split(' ') : []
  return args.map(arg => { return arg.trim() })
}

run()
