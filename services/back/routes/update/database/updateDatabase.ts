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

type KikiMeters = {
  date: string,
  user: string,
  counter: number,
}

const computeOwnerLinesByCommit = async ({
  path,
  map_date_to_commit_id,
  array_of_valid_extensions,
}: {
  path: string,
  map_date_to_commit_id: Record<string, string | undefined>,
  array_of_valid_extensions: Array<string>,
}) => {
  const extensions_regex = array_of_valid_extensions.map((extension) => `(.*${extension}$)`).join('|')
  const array_of_entries_of_map_date_to_commit_id = Object.entries(map_date_to_commit_id)

  const array_of_kiki_meters: Array<KikiMeters> = []

  for (let i = 0; i < array_of_entries_of_map_date_to_commit_id.length; i++) {
    const [commit_date, commit_id] = array_of_entries_of_map_date_to_commit_id[i]
    const output = await exec({
      cmd: `cd ${path} && git checkout ${commit_id} && git ls-files | grep -E '${extensions_regex}' | xargs -I {} git blame -e {} | perl -pe 's/^[^<>]*\\<([^<>]*)\\>.*\$/\\1/' | sort | uniq -c`,
    })

    const array_of_stats = checkIsItReallyAnArrayAndReturnOne({ value_to_check: output })

    array_of_stats.forEach((stat) => {
      const clean_stat = stat.trim()
      const [count, user] = clean_stat.split(' ')
      const counter = parseInt(count)

      if (count && user) {
        array_of_kiki_meters.push({
          date: commit_date,
          user,
          counter,
        })
      }
    })
  }

  return array_of_kiki_meters
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

const writeOnOutputFile = async ({
  map_repos_to_date_to_user_with_owner_lines,
}: {
  map_repos_to_date_to_user_with_owner_lines: Record<string, Array<KikiMeters>>,
}) => {
  const file_full_path = '/workdir/database/kikimeters.json'
  const content_file = JSON.stringify(map_repos_to_date_to_user_with_owner_lines, null, 2)

  await Deno.writeTextFileSync(file_full_path, content_file)

  await exec({
    cmd: `chown 1000:1000 ${file_full_path}`,
  })
}

const updateDatabase = async () => {
  try {
    const root_path = '/workdir/repos-to-check'
    const url = 'git@github.com:heartblood91/my-portfolio.git'
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
      await execGitPull({ path: full_path })
    } else {
      await execGitClone({
        url,
        root_path,
        name_path,
      })
    }

    const map_date_to_commit_id = await computeMapDateToCommitId({ path: full_path }) ?? {}

    const array_of_kiki_meters = await computeOwnerLinesByCommit({
      path: full_path,
      map_date_to_commit_id,
      array_of_valid_extensions,
    })

    const map_repos_to_date_to_user_with_owner_lines = {
      [name_path]: array_of_kiki_meters,
    }

    await returnToMaster({
      path: full_path,
    })

    await writeOnOutputFile({
      map_repos_to_date_to_user_with_owner_lines,
    })
  } catch (e) {
    console.error(e)
  }

}

export default updateDatabase
