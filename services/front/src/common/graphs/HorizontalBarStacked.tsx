import React from "react"
import { useTheme } from '@mui/material/styles'
import { Chart, ChartData, registerables } from "chart.js"
import {
  Card,
  CardContent,
  CardHeader,
} from "@mui/material"

// When we run the test, registerables is undefined.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
Chart.register(...(registerables ?? []))

type Props = {
  data: ChartData<"bar", number[], String>,
  chart_title: string,
  in_percent?: boolean,
}

const HorizontalBarStacked = ({
  data,
  chart_title,
  in_percent = false,
}: Props) => {
  const theme = useTheme()
  const ref = React.useRef<null | HTMLCanvasElement>(null)

  const color = React.useMemo(() => {
    if (theme.palette.mode === 'dark') {
      return 'white'
    } else {
      return 'black'
    }
  }, [theme.palette.mode])

  const options_for_percent_data = React.useMemo(() => {
    if (in_percent) {
      return {
        min: 0,
        max: 100,
      }
    } else {
      return {}
    }
  }, [in_percent])

  React.useEffect(() => {
    if (ref.current) {
      const chart = new Chart(ref.current, {
        type: "bar",
        data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color,
              },
            },
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
          scales: {
            x: {
              stacked: true,
              ticks: {
                color,
              },
            },
            y: {
              stacked: true,
              ...options_for_percent_data,
              ticks: {
                color,
              },
            },
          },
        },
      })

      return () => {
        chart.destroy()
      }
    } else {
      return () => { }
    }
  }, [
    ref,
    data,
    color,
    options_for_percent_data,
  ])

  return (
    <Card>
      <div>
        <CardHeader
          title={chart_title}
          sx={{
            display: "flex",
            justifyContent: "center",
          }} />
      </div>
      <CardContent>
        <canvas ref={ref} />
      </CardContent>
    </Card>
  )
}

export default HorizontalBarStacked
