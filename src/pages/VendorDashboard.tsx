import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Package, Clock, CheckCircle, Truck, User, Phone, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CreateOrderForm from '@/components/CreateOrderForm';
import DeliveryAnalytics from '@/components/DeliveryAnalytics';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: string[];
  totalAmount: number;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered';
  address: string;
  assignedDelivery?: string;
  createdAt: Date;
}

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
  currentLocation?: { lat: number; lng: number };
}

interface CreateOrderFormData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: string;
  totalAmount: number;
}

const VendorDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Generate sample orders
    const sampleOrders: Order[] = [
      {
        id: 'ORD001',
        customerName: 'John Doe',
        customerPhone: '+1-555-0123',
        items: ['Pizza Margherita', 'Garlic Bread', 'Coke'],
        totalAmount: 25.99,
        status: 'pending',
        address: '123 Main St, Downtown',
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: 'ORD002',
        customerName: 'Jane Smith',
        customerPhone: '+1-555-0124',
        items: ['Burger Combo', 'Fries', 'Milkshake'],
        totalAmount: 18.50,
        status: 'assigned',
        address: '456 Oak Ave, Midtown',
        assignedDelivery: 'Alex Rodriguez',
        createdAt: new Date(Date.now() - 1000 * 60 * 45)
      },
      {
        id: 'ORD003',
        customerName: 'Mike Johnson',
        customerPhone: '+1-555-0125',
        items: ['Sushi Platter', 'Miso Soup'],
        totalAmount: 32.00,
        status: 'in_transit',
        address: '789 Pine Rd, Uptown',
        assignedDelivery: 'Sarah Chen',
        createdAt: new Date(Date.now() - 1000 * 60 * 15)
      }
    ];

    // Generate sample delivery partners
    const samplePartners: DeliveryPartner[] = [
      {
        id: 'DEL001',
        name: 'Alex Rodriguez',
        phone: '+1-555-1001',
        isAvailable: false
      },
      {
        id: 'DEL002',
        name: 'Sarah Chen',
        phone: '+1-555-1002',
        isAvailable: false
      },
      {
        id: 'DEL003',
        name: 'Mike Thompson',
        phone: '+1-555-1003',
        isAvailable: true
      },
      {
        id: 'DEL004',
        name: 'Lisa Garcia',
        phone: '+1-555-1004',
        isAvailable: true
      }
    ];

    setOrders(sampleOrders);
    setDeliveryPartners(samplePartners);
  }, []);

  const createOrder = (orderData: CreateOrderFormData) => {
    const newOrder: Order = {
      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      items: orderData.items.split(',').map(item => item.trim()),
      totalAmount: orderData.totalAmount,
      status: 'pending',
      address: orderData.deliveryAddress,
      createdAt: new Date()
    };

    setOrders(prev => [newOrder, ...prev]);
    
    toast({
      title: 'Order Created',
      description: `Order ${newOrder.id} has been created successfully`
    });
  };

  const assignDeliveryPartner = (orderId: string, partnerName: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'assigned' as const, assignedDelivery: partnerName }
        : order
    ));

    setDeliveryPartners(prev => prev.map(partner =>
      partner.name === partnerName
        ? { ...partner, isAvailable: false }
        : partner
    ));

    toast({
      title: 'Delivery Partner Assigned',
      description: `${partnerName} has been assigned to order ${orderId}`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name || 'Vendor'}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-8">
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Transit</p>
                      <p className="text-2xl font-bold text-purple-600">{orders.filter(o => o.status === 'in_transit').length}</p>
                    </div>
                    <Truck className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Available Drivers</p>
                      <p className="text-2xl font-bold text-green-600">{deliveryPartners.filter(p => p.isAvailable).length}</p>
                    </div>
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Manage and assign delivery partners to orders</CardDescription>
                  </div>
                  <CreateOrderForm onCreateOrder={createOrder} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(order.status)}
                                <span className="capitalize">{order.status.replace('_', ' ')}</span>
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Customer</p>
                              <p className="font-medium">{order.customerName}</p>
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                <span>{order.customerPhone}</span>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">Delivery Address</p>
                              <div className="flex items-start space-x-1">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                <p className="text-sm">{order.address}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Items</p>
                            <p className="text-sm">{order.items.join(', ')}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="font-bold text-lg">${order.totalAmount}</p>
                            </div>
                            
                            {order.assignedDelivery && (
                              <div>
                                <p className="text-sm text-gray-600">Assigned to</p>
                                <p className="font-medium">{order.assignedDelivery}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {order.status === 'pending' && (
                          <div className="ml-4">
                            <Select onValueChange={(value) => assignDeliveryPartner(order.id, value)}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Assign delivery partner" />
                              </SelectTrigger>
                              <SelectContent>
                                {deliveryPartners
                                  .filter(partner => partner.isAvailable)
                                  .map((partner) => (
                                    <SelectItem key={partner.id} value={partner.name}>
                                      {partner.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <DeliveryAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
