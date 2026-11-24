import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

export const FIXTURE_HOTEL_A = {
  id: "11111111-1111-4000-8000-000000000001",
  name: "Hotel Alpha Grand",
  currency: "PKR",
  timezone: "Asia/Karachi",
  delivery_fee: 15000,
  users: {
    owner: { id: "11111111-1111-4000-8000-000000000002", email: "owner@alpha.local", name: "Alpha Owner", role: Role.owner },
    manager: { id: "11111111-1111-4000-8000-000000000003", email: "manager@alpha.local", name: "Alpha Manager", role: Role.manager },
    chef: { id: "11111111-1111-4000-8000-000000000004", email: "chef@alpha.local", name: "Alpha Chef", role: Role.chef },
    rider: { id: "11111111-1111-4000-8000-000000000005", email: "rider@alpha.local", name: "Alpha Rider", role: Role.rider },
  },
  category: { id: "11111111-1111-4000-8000-000000000010", name: "Alpha Starters" },
  item: { id: "11111111-1111-4000-8000-000000000020", name: "Alpha Soup", price: 45000 },
  customer: { id: "11111111-1111-4000-8000-000000000030", phone: "+923001111111", name: "Customer Alpha" },
  order: { id: "11111111-1111-4000-8000-000000000040", number: "1001", total: 60000 },
  whatsapp: { phone_number_id: "alpha_wa_111", access_token_enc: "enc_alpha_secret_token" },
};

export const FIXTURE_HOTEL_B = {
  id: "22222222-2222-4000-8000-000000000001",
  name: "Hotel Beta Suites",
  currency: "PKR",
  timezone: "Asia/Karachi",
  delivery_fee: 20000,
  users: {
    owner: { id: "22222222-2222-4000-8000-000000000002", email: "owner@beta.local", name: "Beta Owner", role: Role.owner },
    manager: { id: "22222222-2222-4000-8000-000000000003", email: "manager@beta.local", name: "Beta Manager", role: Role.manager },
    chef: { id: "22222222-2222-4000-8000-000000000004", email: "chef@beta.local", name: "Beta Chef", role: Role.chef },
    rider: { id: "22222222-2222-4000-8000-000000000005", email: "rider@beta.local", name: "Beta Rider", role: Role.rider },
  },
  category: { id: "22222222-2222-4000-8000-000000000010", name: "Beta Mains" },
  item: { id: "22222222-2222-4000-8000-000000000020", name: "Beta Biryani", price: 85000 },
  customer: { id: "22222222-2222-4000-8000-000000000030", phone: "+923002222222", name: "Customer Beta" },
  order: { id: "22222222-2222-4000-8000-000000000040", number: "2001", total: 105000 },
  whatsapp: { phone_number_id: "beta_wa_222", access_token_enc: "enc_beta_secret_token" },
};

export function makeUserToken(userId: string, restaurantId: string, role: Role, customSecret = env.JWT_SECRET): string {
  return jwt.sign({ userId, restaurantId, role }, customSecret, { expiresIn: "15m" });
}

export const tokensA = {
  owner: makeUserToken(FIXTURE_HOTEL_A.users.owner.id, FIXTURE_HOTEL_A.id, Role.owner),
  manager: makeUserToken(FIXTURE_HOTEL_A.users.manager.id, FIXTURE_HOTEL_A.id, Role.manager),
  chef: makeUserToken(FIXTURE_HOTEL_A.users.chef.id, FIXTURE_HOTEL_A.id, Role.chef),
  rider: makeUserToken(FIXTURE_HOTEL_A.users.rider.id, FIXTURE_HOTEL_A.id, Role.rider),
};

export const tokensB = {
  owner: makeUserToken(FIXTURE_HOTEL_B.users.owner.id, FIXTURE_HOTEL_B.id, Role.owner),
  manager: makeUserToken(FIXTURE_HOTEL_B.users.manager.id, FIXTURE_HOTEL_B.id, Role.manager),
  chef: makeUserToken(FIXTURE_HOTEL_B.users.chef.id, FIXTURE_HOTEL_B.id, Role.chef),
  rider: makeUserToken(FIXTURE_HOTEL_B.users.rider.id, FIXTURE_HOTEL_B.id, Role.rider),
};

export async function setupMultiTenantFixture() {
  const ids = [FIXTURE_HOTEL_A.id, FIXTURE_HOTEL_B.id];

  // Ensure clean slate for fixture hotels
  await prisma.orderEvent.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.orderItem.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.paymentProof.deleteMany({ where: { order: { restaurant_id: { in: ids } } } });
  await prisma.order.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.customer.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.menuTranslation.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.menuItem.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.menuCategory.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.restaurantWhatsapp.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.user.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.restaurant.deleteMany({ where: { id: { in: ids } } });

  const passwordHash = await bcrypt.hash("Password123!", 10);

  for (const h of [FIXTURE_HOTEL_A, FIXTURE_HOTEL_B]) {
    // 1. Hotel
    await prisma.restaurant.upsert({
      where: { id: h.id },
      create: {
        id: h.id,
        name: h.name,
        currency: h.currency,
        timezone: h.timezone,
        delivery_fee: h.delivery_fee,
        is_active: true,
      },
      update: {
        name: h.name,
        is_active: true,
      },
    });

    // 2. WhatsApp
    await prisma.restaurantWhatsapp.upsert({
      where: { restaurant_id: h.id },
      create: {
        restaurant_id: h.id,
        phone_number_id: h.whatsapp.phone_number_id,
        waba_id: `waba_${h.id.slice(0, 8)}`,
        access_token_enc: h.whatsapp.access_token_enc,
      },
      update: {
        phone_number_id: h.whatsapp.phone_number_id,
        access_token_enc: h.whatsapp.access_token_enc,
      },
    });

    // 3. Users in all roles
    for (const u of Object.values(h.users)) {
      await prisma.user.upsert({
        where: { email: u.email },
        create: {
          id: u.id,
          restaurant_id: h.id,
          name: u.name,
          email: u.email,
          password_hash: passwordHash,
          role: u.role,
          is_active: true,
        },
        update: {
          restaurant_id: h.id,
          name: u.name,
          role: u.role,
          is_active: true,
        },
      });
    }

    // 4. Menu Category
    await prisma.menuCategory.upsert({
      where: { id: h.category.id },
      create: {
        id: h.category.id,
        restaurant_id: h.id,
        sort_order: 1,
      },
      update: { sort_order: 1 },
    });

    await prisma.menuTranslation.upsert({
      where: {
        restaurant_id_entity_type_entity_id_language: {
          restaurant_id: h.id,
          entity_type: "category",
          entity_id: h.category.id,
          language: "en",
        },
      },
      create: {
        restaurant_id: h.id,
        entity_type: "category",
        entity_id: h.category.id,
        language: "en",
        name: h.category.name,
      },
      update: { name: h.category.name },
    });

    // 5. Menu Item
    await prisma.menuItem.upsert({
      where: { id: h.item.id },
      create: {
        id: h.item.id,
        restaurant_id: h.id,
        category_id: h.category.id,
        price: h.item.price,
        is_available: true,
        sort_order: 1,
      },
      update: {
        price: h.item.price,
        is_available: true,
      },
    });

    await prisma.menuTranslation.upsert({
      where: {
        restaurant_id_entity_type_entity_id_language: {
          restaurant_id: h.id,
          entity_type: "item",
          entity_id: h.item.id,
          language: "en",
        },
      },
      create: {
        restaurant_id: h.id,
        entity_type: "item",
        entity_id: h.item.id,
        language: "en",
        name: h.item.name,
      },
      update: { name: h.item.name },
    });

    // 6. Customer
    await prisma.customer.upsert({
      where: {
        restaurant_id_phone: {
          restaurant_id: h.id,
          phone: h.customer.phone,
        },
      },
      create: {
        id: h.customer.id,
        restaurant_id: h.id,
        phone: h.customer.phone,
        name: h.customer.name,
        language: "en",
        last_address: "Test Address",
      },
      update: {
        name: h.customer.name,
      },
    });

    // 7. Order
    await prisma.order.upsert({
      where: { id: h.order.id },
      create: {
        id: h.order.id,
        restaurant_id: h.id,
        customer_id: h.customer.id,
        number: h.order.number,
        type: OrderType.delivery,
        status: OrderStatus.PENDING,
        payment_method: PaymentMethod.cod,
        payment_status: PaymentStatus.pending,
        subtotal: h.item.price,
        delivery_fee: h.delivery_fee,
        total: h.order.total,
        address: "Test Address",
        items: {
          create: {
            restaurant_id: h.id,
            menu_item_id: h.item.id,
            name_snapshot: h.item.name,
            price_snapshot: h.item.price,
            qty: 1,
          },
        },
        events: {
          create: {
            restaurant_id: h.id,
            status: OrderStatus.PENDING,
            by_user_id: h.users.owner.id,
            note: "Order placed for testing",
          },
        },
      },
      update: {
        status: OrderStatus.PENDING,
      },
    });
  }
}

export async function teardownMultiTenantFixture() {
  const ids = [FIXTURE_HOTEL_A.id, FIXTURE_HOTEL_B.id];
  await prisma.orderEvent.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.orderItem.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.paymentProof.deleteMany({ where: { order: { restaurant_id: { in: ids } } } });
  await prisma.order.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.customer.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.menuTranslation.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.menuItem.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.menuCategory.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.restaurantWhatsapp.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.user.deleteMany({ where: { restaurant_id: { in: ids } } });
  await prisma.restaurant.deleteMany({ where: { id: { in: ids } } });
}
