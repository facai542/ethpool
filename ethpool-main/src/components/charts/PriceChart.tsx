'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js'
import { usePriceHistory } from '@/hooks/useData'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { format } from 'date-fns'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface PriceChartProps {
  coinId: string
  days?: number
  height?: number
  showArea?: boolean
  color?: string
}

export const PriceChart: React.FC<PriceChartProps> = ({
  coinId,
  days = 7,
  height = 300,
  showArea = true,
  color = '#FFD700'
}) => {
  const { data, isLoading, error } = usePriceHistory(coinId, days)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="w-full" style={{ height }} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center bg-muted/10 rounded-lg" style={{ height }}>
        <p className="text-muted-foreground">Failed to load chart data</p>
      </div>
    )
  }

  const labels = data.timestamps.map(timestamp =>
    format(new Date(timestamp), days <= 1 ? 'HH:mm' : 'MMM dd')
  )

  const chartData = {
    labels,
    datasets: [
      {
        label: `${coinId} Price (USD)`,
        data: data.prices,
        borderColor: color,
        backgroundColor: showArea ? `${color}20` : 'transparent',
        fill: showArea,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y
            return `$${value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#888888',
          maxTicksLimit: 6,
        },
      },
      y: {
        display: true,
        position: 'right',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#888888',
          callback: (value) => {
            return `$${Number(value).toLocaleString()}`
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  }

  return (
    <div className="relative" style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
