
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ProgressChartProps {
  data: Array<{
    date: string
    cigarettes: number
    mood: number
  }>
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <Card className="col-span-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
        <CardTitle className="text-gray-900">Xu hướng theo dõi</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={(value:any) => new Date(value).toLocaleDateString("vi-VN")}
            />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip
              labelFormatter={(value:any) => new Date(value).toLocaleDateString("vi-VN")}
              formatter={(value: number, name: string) => [
                value,
                name === "cigarettes" ? "Số điếu thuốc" : "Tâm trạng",
              ]}
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
            />
            <Line type="monotone" dataKey="cigarettes" stroke="#ef4444" strokeWidth={3} name="cigarettes" />
            <Line type="monotone" dataKey="mood" stroke="#16a34a" strokeWidth={3} name="mood" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
