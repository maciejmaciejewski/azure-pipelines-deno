# Azure Pipelines Deno

Azure DevOps extension that provides tasks for acquirung Deno executable and running Deno scripts.

## Deno Download

Task downloads platform specific Deno executable and adds it to the PATH environment variable. After running this task you can use either `Deno Run` task or execute Deno script directly in a shell.

Task takes only one argument `version` (only semantic versioning is supported as of now) which is version of Deno executable to be downloaded.

### YAML

```YAML
steps:
- task: DenoDownload@1
  inputs:
    version: 1.0.3
```

## Deno Run

Task provides a runtime for Deno scripts. It supports running script from remote URL location, from agent filesystem or inline so the content can be kept in your YAML pipeline definition.

The most important parameter of this task is a `targetType` which can take value of either `filePath` (default and thus can be ommited) or `inline`

For the `filePath` execution you need to specify `scriptPath` which can be either absolute or relative file system path or remote URL.

As Deno comes with secured runtime in some cases it is necessary to pass additional permission, which can be done using `permissions` parameters. It takes multiple permissions, each in the separate line.

It is also possible to pass additional args to the script using `arguments` parameter. Arguments should be delimited with space, just like passed in CLI.

Another parameter is an optional `cwd` which set up current working directory for the script

### YAML

#### Script form remote location
```YAML
- task: DenoRun@1
  inputs:
    filePath: 'https://deno.land/std/examples/welcome.ts'
```

#### Script for file system

```YAML
- task: DenoRun@1
  inputs:
    filePath: $(System.DefaultWorkingDirectory)/welcome.ts
    cwd: '/tmp'
```

#### Inline script

```YAML
- task: DenoRun@1
  inputs:
    targetType: 'inline'
    script: |
      import { existsSync } from 'https://deno.land/std/fs/mod.ts'
      console.log(existsSync('/tmp'))
    permissions: |
      --unstable
      --allow-read
```

### Icons

Icons made by Freepik from www.flaticon.com
