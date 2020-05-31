const { platform, arch } = require('os')
const toolLib = require('azure-pipelines-tool-lib/tool')
const taskLib = require('azure-pipelines-task-lib/task')
const { join } = require('path')

function getDownloadUrl (version) {
  const agentPlatform = platform()
  const agentArchitecture = arch()

  if (agentArchitecture !== 'x64') {
    throw new Error(`Architecture ${agentArchitecture} is not supported`)
  }

  let targetFile
  switch (agentPlatform) {
    case "linux": targetFile = 'deno-x86_64-unknown-linux-gnu.zip'; break;
    case "darwin": targetFile = 'deno-x86_64-apple-darwin.zip'; break;
    case "win32": targetFile = 'deno-x86_64-pc-windows-msvc.zip'; break;
    default: throw new Error(`Unexpected OS '${agentPlatform}'`);
  }

  const url = `https://github.com/denoland/deno/releases/download/v${version}/${targetFile}`
  return url
}

async function acquireDeno (downloadUrl) {
  const downloadPath = await toolLib.downloadTool(downloadUrl)
  const extractPath = await toolLib.extractZip(downloadPath, join(taskLib.getVariable('Agent.TempDirectory'), 'deno'))

  const toolPath = await toolLib.cacheDir(extractPath, 'deno', '1.2.0')
}

async function run() {
  try {
    const downloadUrl = getDownloadUrl('1.0.3')
    await acquireDeno(downloadUrl)
  } catch (error) {
    taskLib.setResult(taskLib.TaskResult.Failed, error.message);
  }
}

run ()
