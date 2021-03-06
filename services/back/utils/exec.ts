type Params = {
  cmd: string,
}

type ExecType = (params: Params) => Promise<Array<string> | Error>

const exec: ExecType = async ({
  cmd,
}: Params) => {
  const process = Deno.run({
    cmd: ["bash", "-c", cmd],
    stdout: "piped",
    stderr: "piped",
  })
  
  const [{success}, raw_output, raw_error] = await Promise.all([
    process.status(),
    process.output(),
    process.stderrOutput()
  ])

  const array_of_outputs = new TextDecoder().decode(raw_output)?.split('\n')?.filter(a => a !== '') ?? []
  const array_of_errors = new TextDecoder().decode(raw_error)?.split('\n')?.filter(a => a !== '') ?? []

  process.close()

  return new Promise((resolve, reject) => {
    if (success) {
      resolve(array_of_outputs)
    } else {
      reject(new Error(`Whoops! ${array_of_errors.join(' ')}`))
    }
  })
}

export default exec
