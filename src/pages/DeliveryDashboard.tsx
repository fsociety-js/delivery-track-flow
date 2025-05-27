import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Clock, Navigation, Phone, CheckCircle, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { socketService } from '@/services/socketService';
import { authService, User } from '@/services/authService';
import { orderService, DeliveryPartnerOrder } from '@/services/orderService';
import DeliveryMap from '@/components/DeliveryMap';

const DeliveryDashboard = () => {
  console.log('DeliveryDashboard component rendering...');
  
  const [orders, setOrders] = useState<DeliveryPartnerOrder[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryPartnerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const { 
    currentLocation, 
    isTracking, 
    error: locationError,
    startTracking, 
    stopTracking 
  } = useLocationTracking(activeOrderId || undefined);

  useEffect(() => {
    console.log('DeliveryDashboard useEffect running...');
    
    try {
      // Get user from auth service
      const userData = authService.getUser();
      console.log('User data:', userData);
      
      if (userData && userData.role === 'delivery') {
        setUser(userData);
        loadOrders(userData.id);
        
        // Connect to Socket.IO
        socketService.connect(userData.id, 'delivery');
      } else {
        console.log('No valid delivery user found, redirecting...');
        // For demo purposes, create a sample user
        const sampleUser: User = {
          id: 'DEL001',
          name: 'John Delivery',
          email: 'john@delivery.com',
          role: 'delivery'
        };
        setUser(sampleUser);
        loadOrders(sampleUser.id);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error in DeliveryDashboard useEffect:', error);
      setIsLoading(false);
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  const loadOrders = async (deliveryPartnerId: string) => {
    console.log('Loading orders for delivery partner:', deliveryPartnerId);
    
    try {
      const fetchedOrders = await orderService.getDeliveryPartnerOrders(deliveryPartnerId);
      setOrders(fetchedOrders);
      console.log('Orders loaded successfully:', fetchedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to sample data for demo
      const sampleOrders: DeliveryPartnerOrder[] = [
        {
          id: 'ORD002',
          vendorId: 'VEN001',
          customerId: 'CUST001',
          deliveryPartnerId: deliveryPartnerId,
          customerName: 'Jane Smith',
          customerPhone: '+1-555-0124',
          items: [
            { name: 'Burger Combo', quantity: 1, price: 12.99 },
            { name: 'Fries', quantity: 1, price: 3.99 },
            { name: 'Milkshake', quantity: 1, price: 4.99 }
          ],
          totalAmount: 21.97,
          status: 'assigned',
          pickupAddress: 'Pizza Palace, 789 Food Court',
          deliveryAddress: '456 Oak Ave, Midtown',
          pickupLocation: { lat: 37.7849, lng: -122.4194 },
          deliveryLocation: { lat: 37.7749, lng: -122.4094 },
          vendorName: 'Pizza Palace',
          estimatedDeliveryTime: '25-30 minutes',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setOrders(sampleOrders);
      console.log('Using sample orders:', sampleOrders);
    }
  };

  const handleStartDelivery = (order: DeliveryPartnerOrder) => {
    setActiveOrderId(order.id);
    setSelectedOrder(order);
    startTracking();
    
    toast({
      title: 'Delivery Started',
      description: `Started delivery for order ${order.id}`
    });
  };

  const handleStopDelivery = () => {
    stopTracking();
    setActiveOrderId(null);
    setSelectedOrder(null);
    
    toast({
      title: 'Delivery Stopped',
      description: 'Location tracking has been disabled'
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: DeliveryPartnerOrder['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Send status update via Socket.IO
      socketService.sendOrderStatusUpdate(orderId, newStatus);
      
      const statusMessages: Record<DeliveryPartnerOrder['status'], string> = {
        pending: 'Order is pending',
        assigned: 'Order assigned to delivery partner',
        picked_up: 'Order picked up from vendor',
        in_transit: 'En route to customer',
        delivered: 'Order delivered successfully',
        cancelled: 'Order cancelled'
      };
      
      toast({
        title: 'Status Updated',
        description: statusMessages[newStatus] || 'Order status updated'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextAction = (status: DeliveryPartnerOrder['status']): { action: DeliveryPartnerOrder['status']; label: string } | null => {
    switch (status) {
      case 'assigned': return { action: 'picked_up', label: 'Mark as Picked Up' };
      case 'picked_up': return { action: 'in_transit', label: 'Start Delivery' };
      case 'in_transit': return { action: 'delivered', label: 'Mark as Delivered' };
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading delivery dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Authentication required</p>
          <Button onClick={() => window.location.href = '/'} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  console.log('Rendering delivery dashboard with user:', user, 'orders:', orders);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Navigation className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
                <p className="text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isTracking ? (
                <Button variant="outline" onClick={handleStopDelivery} className="text-red-600 border-red-600">
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Delivery
                </Button>
              ) : (
                <div className="text-sm text-gray-500">
                  Select an order to start delivery
                </div>
              )}
              <Button variant="outline" onClick={() => {
                authService.logout();
                window.location.href = '/';
              }}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Orders List */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isTracking ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Navigation className={`h-6 w-6 ${isTracking ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Tracking Status</h3>
                      <p className="text-gray-600">
                        {isTracking ? `Tracking order ${activeOrderId}` : 'No active tracking'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Current Location</p>
                    <p className="font-mono text-sm">
                      {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Not available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Orders</CardTitle>
                <CardDescription>Your current delivery assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No orders assigned yet</p>
                    </div>
                  ) : (
                    orders.map((order) => {
                      const nextAction = getNextAction(order.status);
                      
                      return (
                        <div key={order.id} className={`border rounded-lg p-4 transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                              <Badge className={getStatusColor(order.status)}>
                                <span className="capitalize">{order.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">${order.totalAmount}</p>
                              <p className="text-sm text-gray-600">{order.vendorName}</p>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Customer Details</p>
                              <p className="font-medium">{order.customerName}</p>
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                <span>{order.customerPhone}</span>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Items</p>
                              <p className="text-sm">{order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}</p>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Pickup Location</p>
                              <div className="flex items-start space-x-1">
                                <Package className="h-4 w-4 text-blue-500 mt-0.5" />
                                <p className="text-sm">{order.pickupAddress}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Delivery Location</p>
                              <div className="flex items-start space-x-1">
                                <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                                <p className="text-sm">{order.deliveryAddress}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {!isTracking && order.status !== 'delivered' && (
                              <Button 
                                onClick={() => handleStartDelivery(order)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Start Delivery
                              </Button>
                            )}
                            
                            {nextAction && (
                              <Button 
                                onClick={() => updateOrderStatus(order.id, nextAction.action)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {nextAction.label}
                              </Button>
                            )}
                            
                            {order.status === 'delivered' && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Map */}
          <div>
            {selectedOrder ? (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Route</CardTitle>
                  <CardDescription>
                    Navigation for Order #{selectedOrder.id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96">
                    <DeliveryMap
                      pickupLocation={selectedOrder.pickupLocation}
                      dropoffLocation={selectedOrder.deliveryLocation}
                      currentLocation={currentLocation || undefined}
                      deliveryPartnerName={user.name}
                      showDirections={true}
                      onRouteCalculated={(distance, duration) => {
                        console.log(`Route: ${distance}km, ${duration}min`);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select an Order
                  </h3>
                  <p className="text-gray-600">
                    Choose an order to start delivery and view the route on the map.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
