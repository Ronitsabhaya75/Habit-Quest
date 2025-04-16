import type React from "react"
export const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <div className="rounded-md shadow-md p-2">{children}</div>
}

export const ChartTooltipContent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

export const ChartContainer = ({
  data,
  children,
  tooltipClassName,
}: {
  data: any[]
  children: React.ReactNode
  tooltipClassName?: string
}) => {
  return <div>{children}</div>
}

export const Chart = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}
