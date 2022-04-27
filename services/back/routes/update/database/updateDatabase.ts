import { exec } from '../../../utils/index.ts'

const createTheRootPathIfNotExist = async ({
  path,
}: {
  path: string,
}) => {
  await exec({
    cmd: `mkdir -p ${path}`
  })

  await exec({
    cmd: `chown 1000:1000 -R ${path}`,
  })
}

const checkIfRepoIsAlreadyThere = async ({
  path,
  name_of_repo_to_check,
}: {
  path: string,
  name_of_repo_to_check: string,
}) => {
  const output = await exec({
    cmd: `ls ${path}`
  })
  const array_of_repos = checkIsItReallyAnArrayAndReturnOne({ value_to_check: output })

  return array_of_repos.includes(name_of_repo_to_check)
}


const execGitPull = async ({
  path,
}: {
  path: string,
}) => {
  await exec({
    cmd: `git -C ${path} pull`
  })
}

const execGitClone = async ({
  root_path,
  url,
  name_path,
}: {
  root_path: string,
  url: string,
  name_path: string,
}) => {
  await exec({
    cmd: `git clone ${url} ${root_path}/${name_path}`,
  })

  await exec({
    cmd: `chown 1000:1000 -R ${root_path}/${name_path}/`,
  })
}

const computeMapDateToCommitId = async ({
  path,
}: {
  path: string,
}) => {
  const output = await exec({
    cmd: `git -C ${path} log --pretty=format:"%H___%ad"`,
  })
  const array_of_commits = checkIsItReallyAnArrayAndReturnOne({ value_to_check: output })

  return array_of_commits.reduce<Record<string, string | undefined>>((acc, commit) => {
    const commit_without_double_quote = commit.replace(/"/gm, '')
    const [commit_id, commit_string_date] = commit_without_double_quote.split('___')
    const commit_date = new Date(commit_string_date).toLocaleDateString('fr-ca')

    if (!acc[commit_date]) {
      acc[commit_date] = commit_id
    }

    return acc
  }, {})
}

const removeCommitBeforeMonoRepository = ({
  map_date_to_commit_id,
  url,
}: {
  map_date_to_commit_id: Record<string, string | undefined>,
  url: string,
}) => {
  if (url === 'git@github.com:Examin-compliance/exaCompose.git') {
    return Object.entries(map_date_to_commit_id).reduce<Record<string, string | undefined>>((acc, [date, commit_id]) => {
      const mono_repo_date = new Date('2022-03-09')
      const current_date = new Date(date)
  
      const mono_repo_date_utc = new Date(Date.UTC(mono_repo_date.getFullYear(), mono_repo_date.getMonth(), mono_repo_date.getDate(), 0, 0, 0, 0))
      const current_date_utc = new Date(Date.UTC(current_date.getFullYear(), current_date.getMonth(), current_date.getDate(), 0, 0, 0, 0))
      
      const delta = current_date_utc.getTime() - mono_repo_date_utc.getTime()
  
      if (0 < delta) {
        acc[date] = commit_id
      }
  
      return acc
    }, {})
  } else {
    return map_date_to_commit_id
  }
}

type KikiMeters = {
  date: string,
  user: string,
  counter: number,
  commit_id: string,
}

const computeOwnerLinesByCommit = async ({
  path,
  map_date_to_commit_id,
  array_of_valid_extensions,
  name_path,
  output_database,
}: {
  path: string,
  map_date_to_commit_id: Record<string, string | undefined>,
  array_of_valid_extensions: Array<string>,
  name_path: string,
  output_database: string,
}) => {
  const extensions_regex = array_of_valid_extensions.map((extension) => `(.*${extension}$)`).join('|')
  const array_of_commit_ids_on_database = await getArrayOfCommitIdsOnDatabase({
    output_database,
    name_path,
  })

  const filtered_map_date_to_commit_id = Object.entries(map_date_to_commit_id).reduce<Record<string, string | undefined>>((acc, [date, commit_id]) => {
      if (!array_of_commit_ids_on_database.includes(commit_id ?? '')){
        acc[date] = commit_id
      }
      return acc
    }, {})
  
  const array_of_entries_of_map_date_to_commit_id = Object.entries(filtered_map_date_to_commit_id)

  for (let i = 0; i < array_of_entries_of_map_date_to_commit_id.length; i++) {
    const [commit_date, commit_id] = array_of_entries_of_map_date_to_commit_id[i]
    const output = await exec({
      cmd: `cd ${path} && git checkout ${commit_id} && git ls-files | grep -E '${extensions_regex}' | xargs -I {} git blame -e {} | perl -pe 's/^[^<>]*\\<([^<>]*)\\>.*\$/\\1/' | sort | uniq -c`,
    })

      const array_of_stats = checkIsItReallyAnArrayAndReturnOne({ value_to_check: output })
      const array_of_kiki_meters = array_of_stats.reduce<Array<KikiMeters>>((acc, stat) => {
        const clean_stat = stat.trim()
        const [count, user] = clean_stat.split(' ')
        const counter = parseInt(count)
  
        if (count && user) {
          acc.push({
            date: commit_date,
            user,
            counter,
            commit_id: commit_id ?? '',
          })
        }
  
        return acc
  
      }, [])

      const map_repos_to_array_of_kikimeters: Record<string, Array<KikiMeters>> = {
        [name_path]: array_of_kiki_meters,
      }

      await writeOnOutputFile({
        map_repos_to_array_of_kikimeters,
        output_database,
        name_path,
      })
  }
}

const checkIsItReallyAnArrayAndReturnOne = ({
  value_to_check,
}: {
  value_to_check: Array<string> | Error,
}) => {
  if (Array.isArray(value_to_check)) {
    return value_to_check
  } else {
    return []
  }

}

const returnToMaster = async ({
  path,
}: {
  path: string,
}) => {
  await exec({
    cmd: `git -C ${path} checkout master`,
  })
}

const getDatabase = async ({
  output_database,
}: {
  output_database: string,
}) => {
  const content_file = await Deno.readTextFile(output_database)
  const database: Record<string, Array<KikiMeters>> = JSON.parse(content_file)

  return database
}

const getArrayOfCommitIdsOnDatabase = async ({
  output_database,
  name_path,
}:{
  output_database: string,
  name_path: string,
}) => {
  const database = await getDatabase({output_database})
  const array_of_commits: Array<string> = []

  if (database[name_path]) {
    const array_of_kiki_meters = database[name_path]
    array_of_kiki_meters.forEach((kikimeter) => array_of_commits.push(kikimeter.commit_id))
  }

  return array_of_commits
}

const writeOnOutputFile = async ({
  map_repos_to_array_of_kikimeters,
  output_database,
  name_path,
}: {
  map_repos_to_array_of_kikimeters: Record<string, Array<KikiMeters>>,
  output_database: string,
  name_path: string,
}) => {
  const database = await getDatabase({output_database})

  let new_database: Record<string, KikiMeters[]> = {}
  if (database[name_path]) {
    const array_of_kiki_meters = [...database[name_path]]
    const current_array_of_kiki_meters = map_repos_to_array_of_kikimeters[name_path]
    const next_array_of_kiki_meters = [...array_of_kiki_meters, ...current_array_of_kiki_meters]

    new_database = {
      ...database,
      [name_path]: next_array_of_kiki_meters,
    }
  } else {
    new_database = { 
      ...database,
      ...map_repos_to_array_of_kikimeters,
    }
  }

  const content_file = JSON.stringify(new_database, null, 2)

  await Deno.writeTextFileSync(output_database, content_file)

  await exec({
    cmd: `chown 1000:1000 ${output_database}`,
  })
}

const updateDatabase = async () => {
  try {
    const output_database = '/workdir/database/kikimeters.json'
    const root_path = '/workdir/repos-to-check'
    const url = 'git@github.com:Examin-compliance/exaCompose.git'
    const array_of_valid_extensions = [
      '.md',
      '.txt',
      '.sh',
      '.bash',
      '.j2',
      '.conf',
      '.cfg',
      '.cf',
      '.yml',
      '.js',
      '.jsx',
      '.test.js',
      '.tsx',
      '.ts',
      '.json',
      '.html',
      '.pl',
    ]

    const name_path = url
      .split('/')
      ?.filter(a => a.endsWith('.git'))
      ?.[0]
      ?.split('.git')
      ?.[0]

    const full_path = `${root_path}/${name_path}/`

    await createTheRootPathIfNotExist({ path: root_path })

    const isAlreadyThere = await checkIfRepoIsAlreadyThere({
      path: root_path,
      name_of_repo_to_check: name_path,
    })

    if (isAlreadyThere) {
      await returnToMaster({
        path: full_path,
      })
      
      await execGitPull({ path: full_path })
    } else {
      await execGitClone({
        url,
        root_path,
        name_path,
      })
    }

    const map_date_to_commit_id_raw = await computeMapDateToCommitId({ path: full_path }) ?? {}

    const map_date_to_commit_id = removeCommitBeforeMonoRepository({
      map_date_to_commit_id: map_date_to_commit_id_raw,
      url,
    })

    await computeOwnerLinesByCommit({
      path: full_path,
      map_date_to_commit_id,
      array_of_valid_extensions,
      name_path,
      output_database,
    })

    await returnToMaster({
      path: full_path,
    })

  } catch (e) {
    console.error(e)
  }

}

export default updateDatabase
