
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Truck, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'vendor' | 'delivery' | 'customer'>('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate authentication
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      email: formData.email,
      name: formData.name || formData.email.split('@')[0],
      type: userType
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    toast({
      title: `${isLogin ? 'Login' : 'Registration'} Successful`,
      description: `Welcome ${userData.name}!`
    });

    // Redirect based on user type
    setTimeout(() => {
      if (userType === 'vendor') {
        window.location.href = '/vendor-dashboard';
      } else if (userType === 'delivery') {
        window.location.href = '/delivery-dashboard';
      } else {
        window.location.href = '/customer-tracking';
      }
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <MapPin className="h-12 w-12 text-blue-600" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DeliveryTrack Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time location tracking for multivendor delivery platform. 
            Track your orders, manage deliveries, and provide exceptional customer experience.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle>Vendor Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Manage orders and assign delivery partners with ease</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Truck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle>Delivery Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Real-time location updates and delivery management</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle>Customer Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Live tracking with estimated delivery times</p>
            </CardContent>
          </Card>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
              <CardDescription>
                {isLogin ? 'Access your dashboard' : 'Join our delivery platform'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={userType} onValueChange={(value) => setUserType(value as any)} className="mb-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="customer">Customer</TabsTrigger>
                  <TabsTrigger value="vendor">Vendor</TabsTrigger>
                  <TabsTrigger value="delivery">Delivery</TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required={!isLogin}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required={!isLogin}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
