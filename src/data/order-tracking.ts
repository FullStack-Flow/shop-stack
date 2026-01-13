// Mock data - in real app, this would come from API
export const mockTrackingData = {
  orderId: '20002455468764',
  orderDate: '21 May, 2024',
  itemsCount: 3,
  total: 390.0,
  carrier: 'FedEx Express',
  trackingNumber: 'FDX123456789',
  currentLocation: 'Distribution Center, New York, NY',
  estimatedDelivery: '28 May, 2024',
  packageInfo: {
    weight: '2.5 lbs',
    dimensions: '12" x 8" x 6"',
  },
  stages: [
    {
      id: '1',
      label: 'Order Placed',
      date: '21 May, 10:30 AM',
      status: 'completed' as const,
    },
    {
      id: '2',
      label: 'Processing',
      date: '22 May, 2:15 PM',
      status: 'completed' as const,
    },
    {
      id: '3',
      label: 'Shipped',
      date: '23 May, 9:00 AM',
      status: 'active' as const,
    },
    {
      id: '4',
      label: 'Out for Delivery',
      status: 'pending' as const,
    },
    {
      id: '5',
      label: 'Delivered',
      status: 'pending' as const,
    },
  ],
  updates: [
    {
      id: '1',
      timestamp: '24 May, 8:45 AM',
      location: 'Distribution Center, New York, NY',
      status: 'Package arrived at distribution center',
      isLatest: true,
    },
    {
      id: '2',
      timestamp: '23 May, 6:30 PM',
      location: 'Sorting Facility, Philadelphia, PA',
      status: 'Package in transit',
    },
    {
      id: '3',
      timestamp: '23 May, 9:00 AM',
      location: 'Origin Facility, Delaware, DE',
      status: 'Package picked up by carrier',
    },
    {
      id: '4',
      timestamp: '22 May, 2:15 PM',
      location: 'Warehouse, Delaware, DE',
      status: 'Order processed and ready for shipment',
    },
    {
      id: '5',
      timestamp: '21 May, 10:30 AM',
      location: 'Online',
      status: 'Order placed successfully',
    },
  ],
};
