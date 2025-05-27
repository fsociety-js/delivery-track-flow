import { authService } from './authService';

interface Order {
  id: string;
  vendorId: string;
  customerId: string;
  deliveryPartnerId?: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pickupAddress: string;
  deliveryAddress: string;
  pickupLocation: { lat: number; lng: number };
  deliveryLocation: { lat: number; lng: number };
  vendorName: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryPartnerOrder extends Order {
  deliveryPartnerId: string;
}

interface AssignDeliveryPartnerData {
  orderId: string;
  deliveryPartnerId: string;
}

class OrderService {
  async getVendorOrders(vendorId: string): Promise<Order[]> {
    try {
      const response = await authService.authenticatedFetch(`/orders/vendor/${vendorId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor orders');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      throw error;
    }
  }

  async getDeliveryPartnerOrders(deliveryPartnerId: string): Promise<DeliveryPartnerOrder[]> {
    try {
      const response = await authService.authenticatedFetch(`/orders/delivery/${deliveryPartnerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch delivery partner orders');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching delivery partner orders:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await authService.authenticatedFetch(`/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async assignDeliveryPartner(data: AssignDeliveryPartnerData): Promise<Order> {
    try {
      const response = await authService.authenticatedFetch(`/orders/${data.orderId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ deliveryPartnerId: data.deliveryPartnerId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign delivery partner');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error assigning delivery partner:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const response = await authService.authenticatedFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getAvailableDeliveryPartners(): Promise<Array<{ id: string; name: string; phone: string; isAvailable: boolean }>> {
    try {
      const response = await authService.authenticatedFetch('/delivery-partners/available');
      
      if (!response.ok) {
        throw new Error('Failed to fetch delivery partners');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
export type { Order, DeliveryPartnerOrder, AssignDeliveryPartnerData };
