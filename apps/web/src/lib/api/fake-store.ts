import {
  canTransition,
  type Order,
  type OrderStatus,
  type PaymentStatus,
  type Restaurant,
  type User,
  type MenuCategory,
  type MenuItem,
  type MenuTranslation,
  type AnalyticsSummary,
} from "@app/shared";
import {
  seedRestaurant,
  seedUsers,
  seedCategories,
  seedMenuItems,
  seedCustomers,
  generateSeedOrders,
} from "./seed-data";
import type { GetOrdersParams, PaginatedResponse, MenuResponse } from "./types";

/**
 * In-memory state store for Phase 2 fake data.
 * Changes (status updates, menu item availability, settings) persist until page reload.
 */
class FakeStore {
  private restaurant: Restaurant = { ...seedRestaurant };
  private users: User[] = [...seedUsers];
  private categories: MenuCategory[] = [...seedCategories];
  private menuItems: MenuItem[] = [...seedMenuItems];
  private orders: Order[] = generateSeedOrders();

  // Artificial delay helper (300 to 600 ms) so skeletons are visible
  public async delay(): Promise<void> {
    const ms = Math.floor(Math.random() * 300) + 300;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // --- Orders ---
  public async getOrders(params: GetOrdersParams = {}): Promise<PaginatedResponse<Order>> {
    await this.delay();
    const { status, date, payment, page = 1, pageSize = 20 } = params;

    let filtered = [...this.orders];

    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }

    if (payment && payment !== "all") {
      filtered = filtered.filter((o) => o.payment_method === payment);
    }

    if (date === "today") {
      const todayStr = new Date().toISOString().slice(0, 10);
      filtered = filtered.filter((o) => o.created_at.toString().startsWith(todayStr));
    }

    // Sort newest first
    filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data: paginated,
      meta: {
        page,
        pageSize,
        total,
      },
    };
  }

  public async getOrder(id: string): Promise<Order> {
    await this.delay();
    const order = this.orders.find((o) => o.id === id);
    if (!order) {
      throw new Error(`Order ${id} not found`);
    }
    return { ...order };
  }

  public async updateOrderStatus(id: string, newStatus: OrderStatus): Promise<Order> {
    await this.delay();
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    const currentOrder = this.orders[index];
    if (!canTransition(currentOrder.status, newStatus, currentOrder.type)) {
      throw new Error(
        `Cannot move ${currentOrder.status} to ${newStatus} for ${currentOrder.type}`
      );
    }

    const now = new Date().toISOString();
    const newEvent = {
      id: `evt-${Date.now()}`,
      order_id: id,
      status: newStatus,
      by_user_id: "user-mgr-01",
      by_user_name: "Tariq Khan (Manager)",
      note: `Status updated to ${newStatus}`,
      created_at: now,
    };

    const updated: Order = {
      ...currentOrder,
      status: newStatus,
      updated_at: now,
      events: [...(currentOrder.events || []), newEvent],
    };

    this.orders[index] = updated;
    return { ...updated };
  }

  public async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    await this.delay();
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    const currentOrder = this.orders[index];
    const now = new Date().toISOString();
    const newEvent = {
      id: `evt-${Date.now()}`,
      order_id: id,
      status: currentOrder.status,
      by_user_id: "user-mgr-01",
      by_user_name: "Tariq Khan (Manager)",
      note: `Payment status marked as ${paymentStatus}`,
      created_at: now,
    };

    const updated: Order = {
      ...currentOrder,
      payment_status: paymentStatus,
      updated_at: now,
      events: [...(currentOrder.events || []), newEvent],
    };

    this.orders[index] = updated;
    return { ...updated };
  }

  // Live order arrival simulator (used in Step 2.3)
  public async addPendingOrder(): Promise<Order> {
    await this.delay();
    const cust = seedCustomers[Math.floor(Math.random() * seedCustomers.length)];
    const orderNum = 1000 + this.orders.length + 1;
    const orderId = `order-${orderNum}`;
    const now = new Date().toISOString();

    const item1 = this.menuItems[0];
    const item2 = this.menuItems[6];
    const items = [
      {
        id: `oi-${orderNum}-1`,
        order_id: orderId,
        menu_item_id: item1.id,
        name_snapshot: item1.name || "Special Chicken Biryani",
        price_snapshot: item1.price,
        qty: 2,
      },
      {
        id: `oi-${orderNum}-2`,
        order_id: orderId,
        menu_item_id: item2.id,
        name_snapshot: item2.name || "Garlic Butter Naan",
        price_snapshot: item2.price,
        qty: 3,
      },
    ];

    const subtotal = items.reduce((acc, it) => acc + it.price_snapshot * it.qty, 0);
    const deliveryFee = this.restaurant.delivery_fee;
    const total = subtotal + deliveryFee;

    const newOrder: Order = {
      id: orderId,
      restaurant_id: this.restaurant.id,
      customer_id: cust.id,
      number: `#${orderNum}`,
      type: "delivery",
      status: "PENDING",
      payment_method: "cod",
      payment_status: "pending",
      subtotal,
      delivery_fee: deliveryFee,
      total,
      address: cust.last_address,
      scheduled_for: null,
      created_at: now,
      updated_at: now,
      customer: cust,
      items,
      events: [
        {
          id: `evt-${Date.now()}`,
          order_id: orderId,
          status: "PENDING",
          by_user_id: null,
          by_user_name: "Customer (WhatsApp Bot)",
          note: "New order placed via WhatsApp",
          created_at: now,
        },
      ],
      payment_proofs: [],
    };

    // Prepend to orders list
    this.orders.unshift(newOrder);
    return { ...newOrder };
  }

  // --- Menu ---
  public async getMenu(): Promise<MenuResponse> {
    await this.delay();
    return {
      categories: [...this.categories],
      items: [...this.menuItems],
    };
  }

  public async updateMenuItem(
    id: string,
    data: Partial<MenuItem> & { translations?: MenuTranslation[] }
  ): Promise<MenuItem> {
    await this.delay();
    const index = this.menuItems.findIndex((it) => it.id === id);
    if (index === -1) {
      throw new Error(`Menu item ${id} not found`);
    }

    const updated: MenuItem = {
      ...this.menuItems[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.menuItems[index] = updated;
    return { ...updated };
  }

  public async setItemAvailability(id: string, is_available: boolean): Promise<MenuItem> {
    await this.delay();
    const index = this.menuItems.findIndex((it) => it.id === id);
    if (index === -1) {
      throw new Error(`Menu item ${id} not found`);
    }

    const updated: MenuItem = {
      ...this.menuItems[index],
      is_available,
      updated_at: new Date().toISOString(),
    };

    this.menuItems[index] = updated;
    return { ...updated };
  }

  // --- Team ---
  public async getTeam(): Promise<User[]> {
    await this.delay();
    return [...this.users];
  }

  // --- Settings ---
  public async getSettings(): Promise<Restaurant> {
    await this.delay();
    return { ...this.restaurant };
  }

  public async updateSettings(data: Partial<Restaurant>): Promise<Restaurant> {
    await this.delay();
    this.restaurant = {
      ...this.restaurant,
      ...data,
      updated_at: new Date().toISOString(),
    };
    return { ...this.restaurant };
  }

  // --- Analytics ---
  public async getAnalyticsSummary(
    range: "today" | "7d" | "30d" = "today"
  ): Promise<AnalyticsSummary> {
    await this.delay();

    if (range === "today") {
      return {
        range: "today",
        totalSales: 3480000, // Rs 34,800.00
        orderCount: 28,
        averageOrderValue: 124285, // Rs 1,242.85
        codShare: 0.64,
        ordersPerHour: [
          { hour: "11:00", count: 2 },
          { hour: "12:00", count: 4 },
          { hour: "13:00", count: 7 },
          { hour: "14:00", count: 5 },
          { hour: "15:00", count: 2 },
          { hour: "16:00", count: 1 },
          { hour: "17:00", count: 3 },
          { hour: "18:00", count: 6 },
          { hour: "19:00", count: 8 },
          { hour: "20:00", count: 12, isPeak: true },
          { hour: "21:00", count: 10 },
          { hour: "22:00", count: 4 },
        ],
        salesOverTime: [
          { date: "12:00", sales: 450000 },
          { date: "14:00", sales: 890000 },
          { date: "16:00", sales: 250000 },
          { date: "18:00", sales: 670000 },
          { date: "20:00", sales: 1540000 },
          { date: "22:00", sales: 580000 },
        ],
        paymentSplit: [
          { method: "cod", count: 18, percentage: 64 },
          { method: "online", count: 10, percentage: 36 },
        ],
        topItems: [
          { id: "item-01", name: "Special Chicken Biryani", quantity: 34, revenue: 1972000 },
          { id: "item-02", name: "Shinwari Mutton Karahi", quantity: 14, revenue: 2310000 },
          { id: "item-07", name: "Garlic Butter Naan", quantity: 58, revenue: 696000 },
          { id: "item-03", name: "Charcoal Chicken Tikka", quantity: 22, revenue: 924000 },
          { id: "item-14", name: "Karak Doodh Patti Chai", quantity: 45, revenue: 630000 },
        ],
      };
    }

    if (range === "7d") {
      return {
        range: "7d",
        totalSales: 24500000, // Rs 245,000.00
        orderCount: 194,
        averageOrderValue: 126288,
        codShare: 0.62,
        ordersPerHour: [
          { hour: "12:00", count: 22 },
          { hour: "14:00", count: 35 },
          { hour: "16:00", count: 18 },
          { hour: "18:00", count: 42 },
          { hour: "20:00", count: 58, isPeak: true },
          { hour: "22:00", count: 28 },
        ],
        salesOverTime: [
          { date: "Mon", sales: 3200000 },
          { date: "Tue", sales: 2950000 },
          { date: "Wed", sales: 3100000 },
          { date: "Thu", sales: 3400000 },
          { date: "Fri", sales: 4200000 },
          { date: "Sat", sales: 4800000 },
          { date: "Sun", sales: 4100000 },
        ],
        paymentSplit: [
          { method: "cod", count: 120, percentage: 62 },
          { method: "online", count: 74, percentage: 38 },
        ],
        topItems: [
          { id: "item-01", name: "Special Chicken Biryani", quantity: 210, revenue: 12180000 },
          { id: "item-02", name: "Shinwari Mutton Karahi", quantity: 82, revenue: 13530000 },
          { id: "item-07", name: "Garlic Butter Naan", quantity: 380, revenue: 4560000 },
          { id: "item-04", name: "Beef Seekh Kabab", quantity: 120, revenue: 5760000 },
          { id: "item-15", name: "Mango Lassi", quantity: 160, revenue: 4160000 },
        ],
      };
    }

    // 30d
    return {
      range: "30d",
      totalSales: 108400000, // Rs 1,084,000.00
      orderCount: 840,
      averageOrderValue: 129047,
      codShare: 0.60,
      ordersPerHour: [
        { hour: "12:00", count: 95 },
        { hour: "14:00", count: 140 },
        { hour: "16:00", count: 80 },
        { hour: "18:00", count: 185 },
        { hour: "20:00", count: 245, isPeak: true },
        { hour: "22:00", count: 110 },
      ],
      salesOverTime: [
        { date: "Week 1", sales: 24500000 },
        { date: "Week 2", sales: 26200000 },
        { date: "Week 3", sales: 28100000 },
        { date: "Week 4", sales: 29600000 },
      ],
      paymentSplit: [
        { method: "cod", count: 504, percentage: 60 },
        { method: "online", count: 336, percentage: 40 },
      ],
      topItems: [
        { id: "item-01", name: "Special Chicken Biryani", quantity: 940, revenue: 54520000 },
        { id: "item-02", name: "Shinwari Mutton Karahi", quantity: 360, revenue: 59400000 },
        { id: "item-07", name: "Garlic Butter Naan", quantity: 1650, revenue: 19800000 },
        { id: "item-05", name: "Royal Butter Chicken", quantity: 420, revenue: 39900000 },
        { id: "item-13", name: "Shahi Matka Kheer", quantity: 510, revenue: 14280000 },
      ],
    };
  }
}

// Global singleton in-memory instance
export const fakeStore = new FakeStore();
