import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description: string
  gradient?: string
  iconColor?: string
  badgeText?: string
  badgeColor?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  gradient = "from-white to-gray-50",
  iconColor = "text-green-600",
  badgeText,
  badgeColor = "bg-green-100 text-green-800 border-green-200",
}: StatsCardProps) {
  return (
    <Card
      className={`border-0 shadow-xl bg-gradient-to-br ${gradient} hover:shadow-2xl transition-all duration-300 hover:scale-105`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/80 rounded-2xl shadow-sm">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          {badgeText && <Badge className={badgeColor}>{badgeText}</Badge>}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
