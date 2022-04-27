import React from 'react'
import { ChartData } from 'chart.js'
import {
  Divider,
  Typography,
} from '@mui/material'

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
  database: Record<string, Array<KikiMeterType>>,
}

type DataGraphType = ChartData<'bar', number[], String>

const Graphs = () => {
  const {
    map_repo_name_to_array_of_data_graphs,
  } = useGraphs()

  const getTitleOfGraphs = React.useCallback((index_of_data_graphs) => {
    if (index_of_data_graphs === 0) {
      return 'En nombre de lignes'
    } else {
      return 'En pourcentage'
    }
  }, [])

  const hasGraphInPercent = React.useCallback((index_of_data_graphs) => {
    if (index_of_data_graphs === 0) {
      return false
    } else {
      return true
    }
  }, [])

  const array_of_elements = Object.entries(map_repo_name_to_array_of_data_graphs).map(([repo_name, array_of_data_graphs], index) => {
    const array_of_graphs = array_of_data_graphs?.map((data_graphs, index_of_data_graphs) => {
      const title = getTitleOfGraphs(index_of_data_graphs)
      const in_percent = hasGraphInPercent(index_of_data_graphs)
      return (
        <Flex.Item xs={6} key={`data_graph_${index_of_data_graphs}_on_${repo_name}`}>
          <HorizontalBarStacked
            data={data_graphs}
            chart_title={title}
            in_percent={in_percent}
          />
        </Flex.Item>
      )
    }) ?? []

    return (
      <React.Fragment key={`${repo_name}_${index}`}>
        <Flex.Item xs={12}>
          <Divider textAlign="left">{repo_name}</Divider>
        </Flex.Item>
        <Flex.Item xs={12} style={{ paddingBottom: '20px', textAlign: 'center' }}>
          <Typography variant='overline'>
            Representation graphique des lignes de chaque utilisateurs en fonction du temps
          </Typography>
        </Flex.Item>
        <Flex.Item xs={12}>
          <Flex.Container>
            {array_of_graphs}
          </Flex.Container>
        </Flex.Item>
      </React.Fragment >
    )
  })

  return (
    <Flex.Container>
      {array_of_elements}
    </Flex.Container>
  )
}

const useGraphs = () => {
  const [{
    database,
  }, setState] = React.useState<State>({
    database: {},
  })

  React.useEffect(() => {
    fetch('http://api.localhost/get/database')
      .then((res) => res.json())
      .then((resultat) => {
        setState((x) => ({
          ...x,
          database: resultat,
        }))
      })
  }, [])

  const map_repo_name_to_array_of_data_graphs = Object.keys(database).reduce<Record<string, Array<DataGraphType> | undefined>>((acc, repo_name) => {
    const data_for_stacked_bar_chart = getDataForStackedBarChart(database[repo_name], repo_name)
    const data_for_stacked_bar_chart_in_percent = getDataForStackedBarChartInPercent(database[repo_name], repo_name)
    acc[repo_name] = [data_for_stacked_bar_chart, data_for_stacked_bar_chart_in_percent]

    return acc
  }, {})

  return {
    map_repo_name_to_array_of_data_graphs,
  }
}

const getDataForStackedBarChart = (array_of_kikimeter: Array<KikiMeterType>, repo_name: string) => {
  const array_of_labels = getArrayOfLabels(array_of_kikimeter)
  const array_of_users = getArrayOfUsers(array_of_kikimeter)

  const map_date_to_kikimeter = getMapDateToKikimeter({
    array_of_kikimeter,
    array_of_labels,
    array_of_users,
  })

  const {
    reduced_array_of_labels,
    reduced_map_date_to_kikimeter,
  } = reduceSizeOfDataset({
    array_of_labels,
    map_date_to_kikimeter,
  })

  const map_user_to_array_of_counters = getMapUserToArrayOfCounters({
    array_of_labels: reduced_array_of_labels,
    map_date_to_kikimeter: reduced_map_date_to_kikimeter,
  })

  const array_of_datasets = getArrayOfDatasets(map_user_to_array_of_counters)

  const data_graphs: DataGraphType = {
    labels: reduced_array_of_labels,
    datasets: array_of_datasets,
  }

  return data_graphs
}

const getDataForStackedBarChartInPercent = (array_of_kikimeter: Array<KikiMeterType>, repo_name: string) => {
  const array_of_labels = getArrayOfLabels(array_of_kikimeter)
  const array_of_users = getArrayOfUsers(array_of_kikimeter)

  const map_date_to_kikimeter = getMapDateToKikimeter({
    array_of_kikimeter,
    array_of_labels,
    array_of_users,
  })

  const {
    reduced_array_of_labels,
    reduced_map_date_to_kikimeter,
  } = reduceSizeOfDataset({
    array_of_labels,
    map_date_to_kikimeter,
  })

  const map_date_to_total_counter = getMapDateToTotalCounter(reduced_map_date_to_kikimeter)

  const map_date_to_kikimeter_in_percent = getMapDateToKikimeterInPercent({
    map_date_to_kikimeter: reduced_map_date_to_kikimeter,
    map_date_to_total_counter,
  })

  const map_user_to_array_of_counters = getMapUserToArrayOfCounters({
    array_of_labels: reduced_array_of_labels,
    map_date_to_kikimeter: map_date_to_kikimeter_in_percent,
  })
  const array_of_datasets = getArrayOfDatasets(map_user_to_array_of_counters)

  const data_graphs: DataGraphType = {
    labels: reduced_array_of_labels,
    datasets: array_of_datasets,
  }

  return data_graphs
}


const getArrayOfLabels = ((array_of_kikimeter: Array<KikiMeterType>) => {
  const array_of_dates: Array<string> = []
  if (0 < array_of_kikimeter.length) {
    const array_of_kikimeter_sorted = [...array_of_kikimeter].sort((a, b) => a.date.localeCompare(b.date))
    const date_min = new Date(array_of_kikimeter_sorted[0].date)
    const date_max = new Date(array_of_kikimeter_sorted[array_of_kikimeter_sorted.length - 1].date)

    const second_in_ms = 1000
    const minute_in_ms = 60 * second_in_ms
    const hour_in_ms = 60 * minute_in_ms
    const day_in_ms = 24 * hour_in_ms

    const diff_days = (date_max.getTime() - date_min.getTime()) / day_in_ms

    for (let i = 0; i < diff_days; i++) {
      if (i === 0) {
        array_of_dates.push(date_min.toLocaleDateString('fr-ca'))
      }

      date_min.setDate(date_min.getDate() + 1)
      array_of_dates.push(date_min.toLocaleDateString('fr-ca'))
    }
  }

  return array_of_dates
})

const getArrayOfUsers = (array_of_kikimeter: Array<KikiMeterType>) => {
  return array_of_kikimeter.reduce<Array<string>>((acc, value) => {
    if (!acc.includes(value.user)) {
      acc.push(value.user)
    }

    return acc
  }, [])
}

const getMapDateToKikimeter = ({
  array_of_kikimeter,
  array_of_users,
  array_of_labels,
}: {
  array_of_kikimeter: Array<KikiMeterType>,
  array_of_users: Array<string>,
  array_of_labels: Array<string>,
}) => {
  const map_date_to_kikimeter = array_of_kikimeter.reduce<Record<string, Array<KikiMeterType>>>((acc, value) => {
    const date = value.date
    if (acc[date]) {
      acc[date].push(value)
    } else {
      acc[date] = [value]
    }

    return acc
  }, {})

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

  return map_date_to_kikimeter
}

const getMapDateToTotalCounter = (map_date_to_kikimeter: Record<string, KikiMeterType[]>) => {

  return Object.entries(map_date_to_kikimeter).reduce<Record<string, number>>((acc, [date, array_of_kikimeters]) => {
    const sum_of_counter = array_of_kikimeters.reduce<number>((acc, kikimeter) => {
      return acc + kikimeter.counter
    }, 0)

    acc[date] = sum_of_counter

    return acc
  }, {})

}

const getMapDateToKikimeterInPercent = ({
  map_date_to_kikimeter,
  map_date_to_total_counter,
}: {
  map_date_to_kikimeter: Record<string, KikiMeterType[]>,
  map_date_to_total_counter: Record<string, number>,
}) => {
  return Object.entries(map_date_to_kikimeter).reduce<Record<string, KikiMeterType[]>>((acc, [date, array_of_kikimeters]) => {
    const next_array_of_kikimeters = array_of_kikimeters.map(kikimeter => {
      const total_counter = map_date_to_total_counter[date]
      const counter_in_percent = Math.round((kikimeter.counter / total_counter) * 10000) / 100 // allow to round with 2 decimals 

      return {
        ...kikimeter,
        counter: counter_in_percent,
      }
    })

    acc[date] = next_array_of_kikimeters

    return acc
  }, {})
}

const getMapUserToArrayOfCounters = ({
  array_of_labels,
  map_date_to_kikimeter,
}: {
  array_of_labels: Array<string>,
  map_date_to_kikimeter: Record<string, KikiMeterType[]>,
}) => {
  return array_of_labels.reduce<Record<string, Array<number> | undefined>>((acc, label_date) => {
    const array_of_kikimeter_of_current_date = [...map_date_to_kikimeter[label_date]]
    array_of_kikimeter_of_current_date.forEach((kikimeter) => {
      const {
        user,
        counter,
      } = kikimeter

      if (acc[user]) {
        acc[user]?.push(counter)
      } else {
        acc[user] = [counter]
      }
    })

    return acc
  }, {})
}

const getArrayOfDatasets = (map_user_to_array_of_counters: Record<string, number[] | undefined>) => {
  return Object.keys(map_user_to_array_of_counters).map((user, index) => {
    return {
      label: user,
      data: [...map_user_to_array_of_counters[user] ?? []],
      backgroundColor: getColorOfChart(index),
    }
  })
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

const reduceSizeOfDataset = ({
  array_of_labels,
  map_date_to_kikimeter,
}: {
  array_of_labels: Array<string>,
  map_date_to_kikimeter: Record<string, KikiMeterType[]>,
}) => {
  const max_size = 50
  const reminder_value = Math.round(array_of_labels.length / max_size)

  const shallow_of_map_date_to_kikimeter = { ...map_date_to_kikimeter }
  const array_of_dates_to_remove_on_map_date_to_kikimeter: Array<string> = []

  const next_array_of_labels = array_of_labels.filter((label, index, arr) => {

    if (index === 0 || index === arr.length - 1 || index % reminder_value === 0) {
      return true
    } else {
      array_of_dates_to_remove_on_map_date_to_kikimeter.push(label)
      return false
    }
  })

  array_of_dates_to_remove_on_map_date_to_kikimeter.forEach((date) => {
    if (shallow_of_map_date_to_kikimeter[date]) {
      delete shallow_of_map_date_to_kikimeter[date]
    }
  })

  return {
    reduced_array_of_labels: next_array_of_labels,
    reduced_map_date_to_kikimeter: shallow_of_map_date_to_kikimeter,
  }
}


export default Graphs
