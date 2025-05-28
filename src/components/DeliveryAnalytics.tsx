
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, MapPin, Users, Package, Star } from 'lucide-react';

const DeliveryAnalytics = () => {
  // Sample analytics data
  const deliveryTimeData = [
    { day: 'Mon', avgTime: 28, orders: 45 },
    { day: 'Tue', avgTime: 32, orders: 52 },
    { day: 'Wed', avgTime: 25, orders: 48 },
    { day: 'Thu', avgTime: 30, orders: 65 },
    { day: 'Fri', avgTime: 35, orders: 78 },
    { day: 'Sat', avgTime: 40, orders: 85 },
    { day: 'Sun', avgTime: 38, orders: 67 }
  ];

  const agentPerformanceData = [
    { name: 'Alex Rodriguez', orders: 156, avgTime: 25, rating: 4.8, onTime: 94 },
    { name: 'Sarah Chen', orders: 142, avgTime: 28, rating: 4.6, onTime: 91 },
    { name: 'Mike Thompson', orders: 134, avgTime: 32, rating: 4.5, onTime: 88 },
    { name: 'Lisa Garcia', orders: 128, avgTime: 30, rating: 4.7, onTime: 92 }
  ];

  const zoneData = [
    { zone: 'Downtown', orders: 245, avgTime: 22, color: '#8884d8' },
    { zone: 'Midtown', orders: 189, avgTime: 28, color: '#82ca9d' },
    { zone: 'Uptown', orders: 156, avgTime: 35, color: '#ffc658' },
    { zone: 'Suburbs', orders: 98, avgTime: 45, color: '#ff7300' }
  ];

  const orderStatusData = [
    { status: 'Delivered', count: 456, color: '#10b981' },
    { status: 'In Transit', count: 23, color: '#3b82f6' },
    { status: 'Pending', count: 12, color: '#f59e0b' },
    { status: 'Cancelled', count: 8, color: '#ef4444' }
  ];

  const chartConfig = {
    avgTime: {
      label: "Average Time (min)",
      color: "#3b82f6",
    },
    orders: {
      label: "Orders",
      color: "#10b981",
    },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900">31 min</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  5% faster than last week
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
                <p className="text-2xl font-bold text-gray-900">91%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  3% improvement
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Zones</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
                <p className="text-xs text-gray-500">Coverage areas</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agent Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.6</p>
                <p className="text-xs text-gray-500">Average score</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="zones">Zone Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Delivery Time Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Delivery Performance</CardTitle>
                <CardDescription>Average delivery time and order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deliveryTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgTime" fill="var(--color-avgTime)" name="Avg Time (min)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current order status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ status, count }) => `${status}: ${count}`}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Agent Performance</CardTitle>
              <CardDescription>Individual agent metrics and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformanceData.map((agent) => (
                  <div key={agent.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{agent.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{agent.rating}</span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Orders Completed</p>
                        <p className="text-xl font-bold">{agent.orders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg Delivery Time</p>
                        <p className="text-xl font-bold">{agent.avgTime} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">On-Time Rate</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xl font-bold">{agent.onTime}%</p>
                          <Badge variant={agent.onTime >= 90 ? "default" : "secondary"}>
                            {agent.onTime >= 90 ? "Excellent" : "Good"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Zone Performance Heatmap</CardTitle>
                <CardDescription>Delivery performance by area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {zoneData.map((zone) => (
                    <div key={zone.zone} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: zone.color }}
                        ></div>
                        <span className="font-medium">{zone.zone}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{zone.orders} orders</p>
                        <p className="font-semibold">{zone.avgTime} min avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zone Order Volume</CardTitle>
                <CardDescription>Orders by delivery zone</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={zoneData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="zone" type="category" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryAnalytics;
