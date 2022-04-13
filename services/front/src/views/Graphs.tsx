import React from 'react'
import { ChartData } from 'chart.js'

import {
  utils, 
  HorizontalBarStacked,
 } from '../common/graphs/'
import { Flex } from '../common'

type KikiMeterType = {
  date: string,
  user: string,
  counter: number,
}

type State = {
  array_of_kikimeter: Array<KikiMeterType>,
}

const Graphs = () => {
  const { data_graphs } = useGraphs()
  
  return (
    <Flex.Container>
      <Flex.Item xs={2} />
      <Flex.Item xs={8}>
        <HorizontalBarStacked
          data={data_graphs}
          chart_title='Nombre de lignes propriétaire par utilisateurs en fonction du temps'
        />
      </Flex.Item>
      <Flex.Item xs={2} />
    </Flex.Container>
  )
}

const useGraphs = () => {
  const [{
    array_of_kikimeter,
  }, setState] = React.useState<State>({
    array_of_kikimeter: [],
  })

  React.useEffect(() => {
    fetch('http://api.localhost/get/database')
    .then((res) => res.json())
    .then((resultat) => {
      const array_of_repo_name = Object.keys(resultat)
      const first_repo_name = array_of_repo_name[0]

      setState((x) => ({
        ...x,
        array_of_kikimeter: resultat[first_repo_name],
      }))
    })
  }, [])

  const array_of_labels = React.useMemo(() => {
    const array_of_dates: Array<string> = []
    if (0 < array_of_kikimeter.length) {
      const array_of_kikimeter_sorted =  [...array_of_kikimeter].sort((a, b) => a.date.localeCompare(b.date))
      const date_min = new Date(array_of_kikimeter_sorted[0].date)
      const date_max = new Date (array_of_kikimeter_sorted[array_of_kikimeter_sorted.length - 1].date)

      const second_in_ms = 1000
      const minute_in_ms = 60 * second_in_ms
      const hour_in_ms = 60 * minute_in_ms
      const day_in_ms = 24 * hour_in_ms

      const diff_days = (date_max.getTime() - date_min.getTime()) / day_in_ms
      
      for (let i=0; i < diff_days; i++) {
        if (i === 0) {
          array_of_dates.push(date_min.toLocaleDateString('fr-ca'))
        }

        date_min.setDate(date_min.getDate() + 1)
        array_of_dates.push(date_min.toLocaleDateString('fr-ca'))
      }
    }

    return array_of_dates
  }, [
    array_of_kikimeter,
  ])

  const array_of_users = React.useMemo(() => {
    return array_of_kikimeter.reduce<Array<string>>((acc, value) => {
      if (!acc.includes(value.user)) {
        acc.push(value.user)
      }

      return acc
    }, [])
  }, [array_of_kikimeter])

  const map_date_to_kikimeter = React.useMemo(() => {
    return array_of_kikimeter.reduce<Record<string, Array<KikiMeterType>>>((acc, value) => {
      const date = value.date
      if (acc[date]) {
        acc[date].push(value)
      } else {
        acc[date] = [value]
      }

      return acc
    }, {})
  }, [array_of_kikimeter])

  Object.keys(map_date_to_kikimeter).forEach(date => {
    const array_of_current_user = map_date_to_kikimeter[date].map((kikimeter => kikimeter.user))
    const array_of_missing_users = array_of_users.filter((a) => !array_of_current_user.includes(a))
  
    array_of_missing_users.forEach(missing_user => {
      map_date_to_kikimeter[date].push({
        date,
        user: missing_user,
        counter: 0,
      })
    })
  })

  array_of_labels.forEach(label_date => {
    if (!map_date_to_kikimeter[label_date]) {
      const yesterday_date = new Date(label_date)
      yesterday_date.setDate(yesterday_date.getDate() - 1)

      const yesterday = yesterday_date.toLocaleDateString('fr-ca')

      map_date_to_kikimeter[label_date] = [...map_date_to_kikimeter[yesterday]]
    }
  })

  const reduced_array_of_labels = reduceArrayToMaxSize(array_of_labels)

  const map_user_to_array_of_counters = reduced_array_of_labels.reduce<Record<string, Array<number> | undefined>>((acc, label_date) => {
    const array_of_kikimeter_of_current_date = [...map_date_to_kikimeter[label_date]]
    array_of_kikimeter_of_current_date.forEach((kikimeter) => {
      const {
        user, 
        counter,
      } = kikimeter

      if (acc[user]){
        acc[user]?.push(counter)
      } else {
        acc[user] = [counter]
      }
    })

    return acc
  }, {})

  const array_of_datasets = Object.keys(map_user_to_array_of_counters).map((user, index) => {
    return {
      label: user,
      data: [...map_user_to_array_of_counters[user] ?? []],
      backgroundColor: getColorOfChart(index),
    }
  })

  const data_graphs: ChartData<'bar', number[], String> = {
    labels: reduced_array_of_labels,
    datasets: array_of_datasets,
  }
  
  return {
    data_graphs,
  }
}


const getColorOfChart = (index: number) => {
  const reminder = index % 6
  switch (reminder) {
    case 0:
      return utils.CHART_COLORS.blue
      
    case 1:
      return utils.CHART_COLORS.green

    case 2:
      return utils.CHART_COLORS.grey

    case 3:
      return utils.CHART_COLORS.orange

    case 4:
      return utils.CHART_COLORS.purple

    case 5:
      return utils.CHART_COLORS.red

    case 6:
      return utils.CHART_COLORS.yellow
  
    default:
      return utils.CHART_COLORS.blue
  }
}

const reduceArrayToMaxSize = <T extends unknown>(array_of_things: Array<T>) => {
const max_size = 50
const reminder_value = Math.round(array_of_things.length / max_size)

const next_array_of_things = array_of_things.filter((_, index, arr) => {

  if (index === 0 || index === arr.length - 1 || index % reminder_value === 0) {
    return true
  } else {
    return false
  }
})

return next_array_of_things
}


export default Graphs
