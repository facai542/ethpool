'use client'

import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
  type ScriptableContext,
  type ChartOptions,
} from 'chart.js'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ChartData {
  labels: string[]
  datasets: Array<{
    label?: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
    fill?: boolean
    tension?: number
    yAxisID?: string
    hoverOffset?: number
  }>
}

// Use Chart.js built-in tooltip types instead of custom interface

// Hash Rate Distribution Chart
export const HashRateChart: React.FC<{ data?: ChartData; isLoading?: boolean }> = ({
  data,
  isLoading
}) => {
  if (isLoading) {
    return <LoadingSkeleton className="h-64 w-full" variant="card" />
  }

  const chartData = {
    labels: ['Pool 1', 'Pool 2', 'Pool 3', 'Pool 4', 'Others'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          '#FFD700',
          '#FFA500',
          '#FF8C00',
          '#FF7F50',
          '#FF6347',
        ],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            return `${context.label}: ${context.parsed}%`
          },
        },
      },
    },
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}

// Mining Performance Chart
export const MiningPerformanceChart: React.FC<{ data?: ChartData; isLoading?: boolean }> = ({
  data,
  isLoading
}) => {
  if (isLoading) {
    return <LoadingSkeleton className="h-80 w-full" variant="card" />
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  })

  const chartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Hash Rate (TH/s)',
        data: [120, 135, 128, 145, 152, 148, 155],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Rewards (ETH)',
        data: [0.125, 0.142, 0.138, 0.158, 0.165, 0.149, 0.172],
        borderColor: '#00FFFF',
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#888888',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#888888',
          callback: (value) => `${value} TH/s`,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#888888',
          callback: (value) => `${value} ETH`,
        },
      },
    },
  }

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  )
}

// Profitability Chart
export const ProfitabilityChart: React.FC<{ data?: ChartData; isLoading?: boolean }> = ({
  data,
  isLoading
}) => {
  if (isLoading) {
    return <LoadingSkeleton className="h-64 w-full" variant="card" />
  }

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue',
        data: [1250, 1420, 1380, 1580],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: '#22c55e',
        borderWidth: 1,
      },
      {
        label: 'Costs',
        data: [450, 480, 465, 490],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 1,
      },
      {
        label: 'Profit',
        data: [800, 940, 915, 1090],
        backgroundColor: 'rgba(255, 215, 0, 0.8)',
        borderColor: '#FFD700',
        borderWidth: 1,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            return `${context.dataset.label}: ${context.parsed.y}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#888888',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#888888',
          callback: (value) => `${value}`,
        },
      },
    },
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}

// Mining Pool Comparison Chart
export const PoolComparisonChart: React.FC<{ data?: ChartData; isLoading?: boolean }> = ({
  data,
  isLoading
}) => {
  if (isLoading) {
    return <LoadingSkeleton className="h-80 w-full" variant="card" />
  }

  const chartData = {
    labels: ['Binance Pool', 'F2Pool', 'Poolin', 'ViaBTC', 'AntPool'],
    datasets: [
      {
        label: 'Hash Rate (%)',
        data: [18.5, 15.2, 12.8, 11.3, 9.7],
        backgroundColor: [
          '#FFD700',
          '#FFA500',
          '#FF8C00',
          '#FF7F50',
          '#FF6347',
        ],
        borderWidth: 0,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            return `${context.parsed.x}% of network`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#888888',
          callback: (value) => `${value}%`,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#ffffff',
        },
      },
    },
  }

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  )
}
