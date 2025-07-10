"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp } from "lucide-react"

interface ProgressChartProps {
  data: Array<{
    date: string
    cigarettes: number
    mood: number
  }>
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-2xl border-b">
        <CardTitle className="flex items-center gap-3 text-gray-900">
          <TrendingUp className="h-6 w-6 text-green-600" />
          Biểu đồ tiến độ 7 ngày qua
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer
          config={{
            cigarettes: {
              label: "Số điếu thuốc",
              color: "hsl(var(--chart-1))",
            },
            mood: {
              label: "Tâm trạng",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="cigarettesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("vi-VN", { month: "short", day: "numeric" })
                }
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="cigarettes"
                stroke="#ef4444"
                strokeWidth={3}
                fill="url(#cigarettesGradient)"
              />
              <Area type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} fill="url(#moodGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
