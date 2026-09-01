require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const hotelName = process.env.SEED_HOTEL_NAME || 'Adama Hotel';
  const ownerEmail = process.env.SEED_OWNER_EMAIL || 'admin@adama-hotel.com';
  const ownerPassword = process.env.SEED_OWNER_PASSWORD || 'Admin123!';

  console.log('='.repeat(60));
  console.log(`  Seeding database for: ${hotelName}`);
  console.log('='.repeat(60));

  // ─────────────────────────────────────────────
  // 1. Hotel + Theme
  // ─────────────────────────────────────────────
  let hotel = await prisma.hotel.findFirst({ where: { name: hotelName } });
  if (!hotel) {
    hotel = await prisma.hotel.create({
      data: {
        name: hotelName,
        slug: hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: 'A premium hotel experience in the heart of Adama, Ethiopia.',
        contactEmail: 'info@adama-hotel.com',
        contactPhone: '+251-22-111-0000',
        address: 'Bole Road, Adama, Ethiopia',
        operatingHours: '24/7',
        languages: ['en', 'am', 'om'],
        theme: {
          create: {
            templateId: 'classic-grid',
            primaryColor: '#1c1c1c',
            secondaryColor: '#c9a24b',
            backgroundColor: '#faf7f2',
            fontFamily: 'Inter',
          },
        },
      },
    });
    console.log(`  [+] Hotel created: ${hotel.name} (${hotel.id})`);
  } else {
    console.log(`  [=] Hotel already exists: ${hotel.name} (${hotel.id})`);
  }

  // ─────────────────────────────────────────────
  // 2. Departments
  // ─────────────────────────────────────────────
  const departmentDefs = [
    { name: 'Front Office', code: 'FRONT_OFFICE', description: 'Guest reception, check-in/out, concierge' },
    { name: 'Housekeeping', code: 'HOUSEKEEPING', description: 'Room cleaning, laundry, turndown service' },
    { name: 'Restaurant', code: 'RESTAURANT', description: 'Dine-in service, room service delivery' },
    { name: 'Bar', code: 'BAR', description: 'Beverage service, cocktail bar, lounge' },
    { name: 'Kitchen', code: 'KITCHEN', description: 'Food preparation, cooking, plating' },
    { name: 'Spa', code: 'SPA', description: 'Wellness treatments, massage, beauty services' },
    { name: 'Maintenance', code: 'MAINTENANCE', description: 'Facility repairs, equipment upkeep' },
    { name: 'Laundry', code: 'LAUNDRY', description: 'Guest laundry, uniform pressing, dry cleaning' },
    { name: 'Events', code: 'EVENTS', description: 'Banquets, conferences, special events' },
    { name: 'Management', code: 'MANAGEMENT', description: 'Hotel administration, finance, HR' },
  ];

  const departments = {};
  for (const def of departmentDefs) {
    let dept = await prisma.department.findFirst({
      where: { hotelId: hotel.id, code: def.code },
    });
    if (!dept) {
      dept = await prisma.department.create({
        data: { hotelId: hotel.id, ...def },
      });
      console.log(`  [+] Department created: ${dept.name}`);
    }
    departments[def.code] = dept;
  }

  // ─────────────────────────────────────────────
  // 3. Roles (RBAC)
  // ─────────────────────────────────────────────
  const roleDefs = [
    { name: 'SYSTEM_ADMIN', description: 'Full system access. Can manage all resources, settings, and users.', isSystem: true },
    { name: 'GENERAL_MANAGER', description: 'Hotel-wide management. Access to reports, staff, bookings, and settings.', isSystem: true },
    { name: 'FRONT_OFFICE_MANAGER', description: 'Manages front desk operations, bookings, and guest services.', isSystem: false },
    { name: 'RECEPTIONIST', description: 'Handles check-in, check-out, reservations, and guest inquiries.', isSystem: false },
    { name: 'HOUSEKEEPING_MANAGER', description: 'Oversees housekeeping staff, room status, and cleaning schedules.', isSystem: false },
    { name: 'FB_MANAGER', description: 'Food & Beverage manager. Controls menu, kitchen, bar, and restaurant operations.', isSystem: false },
    { name: 'EXECUTIVE_CHEF', description: 'Head chef with full kitchen and menu management access.', isSystem: false },
    { name: 'KITCHEN_SUPERVISOR', description: 'Supervises kitchen stations, order flow, and prep work.', isSystem: false },
    { name: 'FINANCE_MANAGER', description: 'Manages payments, invoices, financial reports, and accounting.', isSystem: false },
    { name: 'SPA_MANAGER', description: 'Manages spa services, treatments, and wellness bookings.', isSystem: false },
    { name: 'GUEST', description: 'Guest-level access for ordering, service requests, and viewing the menu.', isSystem: false },
  ];

  const roles = {};
  for (const def of roleDefs) {
    let role = await prisma.role.findFirst({ where: { name: def.name } });
    if (!role) {
      role = await prisma.role.create({ data: def });
      console.log(`  [+] Role created: ${role.name}`);
    }
    roles[def.name] = role;
  }

  // ─────────────────────────────────────────────
  // 4. Permissions
  // ─────────────────────────────────────────────
  const resourceActions = {
    rooms:              ['read', 'create', 'update', 'delete'],
    bookings:           ['read', 'create', 'update', 'delete', 'check_in', 'check_out'],
    guests:             ['read', 'create', 'update', 'delete'],
    orders:             ['read', 'create', 'update', 'delete', 'cancel'],
    menu:               ['read', 'create', 'update', 'delete'],
    departments:        ['read', 'create', 'update', 'delete'],
    stations:           ['read', 'create', 'update', 'delete'],
    devices:            ['read', 'create', 'update', 'delete'],
    service_requests:   ['read', 'create', 'update', 'delete', 'assign', 'complete'],
    payments:           ['read', 'create', 'update', 'delete', 'refund'],
    reports:            ['read', 'export'],
    users:              ['read', 'create', 'update', 'delete'],
    roles:              ['read', 'create', 'update', 'delete', 'assign'],
    settings:           ['read', 'update'],
    audit_logs:         ['read'],
  };

  const permissions = {};
  const allPermissionData = [];
  for (const [resource, actions] of Object.entries(resourceActions)) {
    for (const action of actions) {
      const key = `${resource}.${action}`;
      const desc = `${action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ')} ${resource.replace(/_/g, ' ')}`;
      allPermissionData.push({ resource, action, description: desc });
    }
  }

  // Use createMany with skipDuplicates for permissions
  await prisma.permission.createMany({ data: allPermissionData, skipDuplicates: true });
  console.log(`  [+] Permissions ensured: ${allPermissionData.length} resource/action combos`);

  // Fetch all permissions into a map
  const allPerms = await prisma.permission.findMany();
  for (const p of allPerms) {
    permissions[`${p.resource}.${p.action}`] = p;
  }

  // ─────────────────────────────────────────────
  // 5. RolePermission assignments
  // ─────────────────────────────────────────────
  const rolePermissionMap = {
    SYSTEM_ADMIN: Object.keys(permissions),
    GENERAL_MANAGER: [
      'rooms.read', 'rooms.update',
      'bookings.read', 'bookings.create', 'bookings.update', 'bookings.check_in', 'bookings.check_out',
      'guests.read', 'guests.create', 'guests.update',
      'orders.read', 'orders.update', 'orders.cancel',
      'menu.read', 'menu.create', 'menu.update',
      'departments.read',
      'stations.read',
      'devices.read',
      'service_requests.read', 'service_requests.assign', 'service_requests.complete',
      'payments.read', 'payments.create',
      'reports.read', 'reports.export',
      'users.read', 'users.create', 'users.update',
      'roles.read', 'roles.assign',
      'settings.read', 'settings.update',
      'audit_logs.read',
    ],
    FRONT_OFFICE_MANAGER: [
      'rooms.read', 'rooms.update',
      'bookings.read', 'bookings.create', 'bookings.update', 'bookings.check_in', 'bookings.check_out',
      'guests.read', 'guests.create', 'guests.update',
      'orders.read', 'orders.update',
      'menu.read',
      'departments.read',
      'service_requests.read', 'service_requests.assign', 'service_requests.complete',
      'payments.read', 'payments.create',
      'reports.read',
      'users.read',
      'settings.read',
    ],
    RECEPTIONIST: [
      'rooms.read',
      'bookings.read', 'bookings.create', 'bookings.update', 'bookings.check_in', 'bookings.check_out',
      'guests.read', 'guests.create', 'guests.update',
      'orders.read',
      'menu.read',
      'service_requests.read', 'service_requests.create',
      'payments.read', 'payments.create',
      'users.read',
    ],
    HOUSEKEEPING_MANAGER: [
      'rooms.read', 'rooms.update',
      'bookings.read',
      'service_requests.read', 'service_requests.assign', 'service_requests.complete',
      'departments.read',
      'stations.read',
      'reports.read',
      'users.read',
    ],
    FB_MANAGER: [
      'rooms.read',
      'orders.read', 'orders.update', 'orders.cancel',
      'menu.read', 'menu.create', 'menu.update', 'menu.delete',
      'departments.read',
      'stations.read', 'stations.update',
      'devices.read',
      'service_requests.read', 'service_requests.assign',
      'payments.read',
      'reports.read', 'reports.export',
      'users.read',
    ],
    EXECUTIVE_CHEF: [
      'rooms.read',
      'orders.read', 'orders.update',
      'menu.read', 'menu.create', 'menu.update',
      'departments.read',
      'stations.read', 'stations.update',
      'devices.read',
      'service_requests.read', 'service_requests.complete',
    ],
    KITCHEN_SUPERVISOR: [
      'orders.read', 'orders.update',
      'menu.read',
      'stations.read',
      'devices.read',
      'service_requests.read',
    ],
    FINANCE_MANAGER: [
      'bookings.read',
      'orders.read',
      'guests.read',
      'payments.read', 'payments.create', 'payments.update', 'payments.refund',
      'reports.read', 'reports.export',
      'audit_logs.read',
      'users.read',
    ],
    SPA_MANAGER: [
      'guests.read',
      'service_requests.read', 'service_requests.assign', 'service_requests.complete',
      'departments.read',
      'stations.read', 'stations.update',
      'devices.read',
      'reports.read',
      'users.read',
    ],
    GUEST: [
      'menu.read',
      'orders.read', 'orders.create',
      'service_requests.read', 'service_requests.create',
      'rooms.read',
    ],
  };

  let rpCount = 0;
  for (const [roleName, permKeys] of Object.entries(rolePermissionMap)) {
    const role = roles[roleName];
    if (!role) continue;

    for (const key of permKeys) {
      const perm = permissions[key];
      if (!perm) continue;
      try {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
        rpCount++;
      } catch (e) {
        // skip duplicate
      }
    }
  }
  console.log(`  [+] Role-Permission assignments created: ${rpCount}`);

  // ─────────────────────────────────────────────
  // 6. Staff + StaffRoleAssignment
  // ─────────────────────────────────────────────
  const staffDefs = [
    {
      name: 'Hotel Owner',
      email: ownerEmail,
      password: ownerPassword,
      staffRole: 'OWNER',
      rbacRole: 'SYSTEM_ADMIN',
      phone: '+251-91-100-0001',
    },
    {
      name: 'Abebe Kebede',
      email: 'manager@adama-hotel.com',
      password: 'Manager123!',
      staffRole: 'MANAGER',
      rbacRole: 'GENERAL_MANAGER',
      phone: '+251-91-100-0002',
    },
    {
      name: 'Fatima Hassan',
      email: 'frontdesk@adama-hotel.com',
      password: 'Front123!',
      staffRole: 'MANAGER',
      rbacRole: 'RECEPTIONIST',
      phone: '+251-91-100-0003',
    },
    {
      name: 'Dawit Tesfaye',
      email: 'chef@adama-hotel.com',
      password: 'Chef123!',
      staffRole: 'KITCHEN',
      rbacRole: 'EXECUTIVE_CHEF',
      phone: '+251-91-100-0004',
    },
    {
      name: 'Hiwot Mengistu',
      email: 'housekeeping@adama-hotel.com',
      password: 'House123!',
      staffRole: 'MANAGER',
      rbacRole: 'HOUSEKEEPING_MANAGER',
      phone: '+251-91-100-0005',
    },
    {
      name: 'Yonas Alemayehu',
      email: 'waiter@adama-hotel.com',
      password: 'Wait123!',
      staffRole: 'WAITER',
      rbacRole: 'GUEST',
      phone: '+251-91-100-0006',
    },
  ];

  const staffMembers = {};
  for (const def of staffDefs) {
    let staff = await prisma.staff.findFirst({ where: { email: def.email } });
    if (!staff) {
      const passwordHash = await bcrypt.hash(def.password, 10);
      staff = await prisma.staff.create({
        data: {
          hotelId: hotel.id,
          name: def.name,
          email: def.email,
          passwordHash,
          role: def.staffRole,
          phone: def.phone,
        },
      });
      console.log(`  [+] Staff created: ${staff.name} (${staff.email})`);
    } else {
      console.log(`  [=] Staff already exists: ${staff.name} (${staff.email})`);
    }
    staffMembers[def.email] = staff;

    // Assign RBAC role
    const rbacRole = roles[def.rbacRole];
    if (rbacRole) {
      try {
        await prisma.staffRoleAssignment.create({
          data: { staffId: staff.id, roleId: rbacRole.id },
        });
      } catch (e) {
        // skip duplicate
      }
    }
  }

  // ─────────────────────────────────────────────
  // 7. Service Stations
  // ─────────────────────────────────────────────
  const stationDefs = [
    { name: 'Front Desk', code: 'FRONTDESK-01', departmentCode: 'FRONT_OFFICE', status: 'ONLINE', deviceIdentifier: 'iPad-FrontDesk-01' },
    { name: 'Main Kitchen', code: 'KITCHEN-01', departmentCode: 'KITCHEN', status: 'ONLINE', deviceIdentifier: 'Tablet-Kitchen-01' },
    { name: 'Main Bar', code: 'BAR-01', departmentCode: 'BAR', status: 'ONLINE', deviceIdentifier: 'Tablet-Bar-01' },
    { name: 'Restaurant Floor', code: 'RESTAURANT-01', departmentCode: 'RESTAURANT', status: 'ONLINE', deviceIdentifier: 'Tablet-Restaurant-01' },
    { name: 'Housekeeping Hub', code: 'HOUSEKEEPING-01', departmentCode: 'HOUSEKEEPING', status: 'ONLINE', deviceIdentifier: 'Phone-HK-01' },
    { name: 'Spa Reception', code: 'SPA-01', departmentCode: 'SPA', status: 'ONLINE', deviceIdentifier: 'iPad-Spa-01' },
  ];

  const stations = {};
  for (const def of stationDefs) {
    let station = await prisma.serviceStation.findFirst({
      where: { hotelId: hotel.id, code: def.code },
    });
    if (!station) {
      const dept = departments[def.departmentCode];
      station = await prisma.serviceStation.create({
        data: {
          hotelId: hotel.id,
          departmentId: dept.id,
          name: def.name,
          code: def.code,
          status: def.status,
          deviceIdentifier: def.deviceIdentifier,
          isActive: true,
        },
      });
      console.log(`  [+] Station created: ${station.name} (${station.code})`);
    }
    stations[def.code] = station;
  }

  // ─────────────────────────────────────────────
  // 8. Locations
  // ─────────────────────────────────────────────
  const locationDefs = [
    { name: 'Room 101', type: 'ROOM', floor: 1, roomNumber: '101', capacity: 2 },
    { name: 'Room 102', type: 'ROOM', floor: 1, roomNumber: '102', capacity: 2 },
    { name: 'Room 103', type: 'ROOM', floor: 1, roomNumber: '103', capacity: 2 },
    { name: 'Room 201', type: 'ROOM', floor: 2, roomNumber: '201', capacity: 2 },
    { name: 'Room 202', type: 'ROOM', floor: 2, roomNumber: '202', capacity: 2 },
    { name: 'Room 301', type: 'ROOM', floor: 3, roomNumber: '301', capacity: 3 },
    { name: 'Room 401', type: 'ROOM', floor: 4, roomNumber: '401', capacity: 3 },
    { name: 'Room 501', type: 'ROOM', floor: 5, roomNumber: '501', capacity: 4 },
    { name: 'Restaurant Table 1', type: 'RESTAURANT_TABLE', capacity: 4 },
    { name: 'Restaurant Table 2', type: 'RESTAURANT_TABLE', capacity: 4 },
    { name: 'Restaurant Table 3', type: 'RESTAURANT_TABLE', capacity: 2 },
    { name: 'Restaurant Table 4', type: 'RESTAURANT_TABLE', capacity: 6 },
    { name: 'Restaurant Table 5', type: 'RESTAURANT_TABLE', capacity: 8 },
    { name: 'Bar Table 1', type: 'BAR_TABLE', capacity: 2 },
    { name: 'Bar Table 2', type: 'BAR_TABLE', capacity: 2 },
    { name: 'Bar Table 3', type: 'BAR_TABLE', capacity: 4 },
    { name: 'Pool Area', type: 'POOL', capacity: 20 },
    { name: 'Lobby', type: 'LOBBY', capacity: 50 },
  ];

  const locationCount = { ROOM: 0, TABLE: 0, OTHER: 0 };
  for (const def of locationDefs) {
    // Build a unique name by appending area info for non-room types
    const locationName = def.name;
    const existing = await prisma.location.findFirst({
      where: { hotelId: hotel.id, name: locationName },
    });
    if (!existing) {
      const qrToken = require('crypto').randomBytes(16).toString('hex');
      await prisma.location.create({
        data: {
          hotelId: hotel.id,
          name: locationName,
          type: def.type,
          floor: def.floor || null,
          roomNumber: def.roomNumber || null,
          capacity: def.capacity || null,
          status: 'active',
          qrToken,
          isActive: true,
        },
      });
      if (def.type === 'ROOM') locationCount.ROOM++;
      else if (def.type.includes('TABLE')) locationCount.TABLE++;
      else locationCount.OTHER++;
    }
  }
  console.log(`  [+] Locations ensured: ${locationDefs.length} total (${locationCount.ROOM} rooms, ${locationCount.TABLE} tables, ${locationCount.OTHER} other)`);

  // ─────────────────────────────────────────────
  // 9. Room Types
  // ─────────────────────────────────────────────
  const roomTypeDefs = [
    {
      name: 'Deluxe Room',
      description: 'Elegantly appointed room with modern amenities and city views.',
      basePrice: 120.0,
      maxCapacity: 2,
      bedType: 'King',
      sizeSqm: 35,
      amenities: ['air_conditioning', 'minibar', 'wifi', 'safe', 'smart_tv', 'rain_shower'],
      sortOrder: 0,
    },
    {
      name: 'Junior Suite',
      description: 'Spacious suite with separate living area, ideal for extended stays.',
      basePrice: 220.0,
      maxCapacity: 3,
      bedType: 'King',
      sizeSqm: 55,
      amenities: ['air_conditioning', 'minibar', 'wifi', 'safe', 'smart_tv', 'rain_shower', 'sofa', 'work_desk', 'coffee_machine'],
      sortOrder: 1,
    },
    {
      name: 'Presidential Suite',
      description: 'The pinnacle of luxury with panoramic views, private lounge, and butler service.',
      basePrice: 500.0,
      maxCapacity: 4,
      bedType: 'King',
      sizeSqm: 120,
      amenities: ['air_conditioning', 'minibar', 'wifi', 'safe', 'smart_tv', 'rain_shower', 'jacuzzi', 'sofa', 'work_desk', 'coffee_machine', 'private_bar', 'dining_area', 'panoramic_view'],
      sortOrder: 2,
    },
  ];

  const roomTypes = {};
  for (const def of roomTypeDefs) {
    let rt = await prisma.roomType.findFirst({
      where: { hotelId: hotel.id, name: def.name },
    });
    if (!rt) {
      rt = await prisma.roomType.create({
        data: { hotelId: hotel.id, ...def },
      });
      console.log(`  [+] Room Type created: ${rt.name} ($${rt.basePrice}/night)`);
    }
    roomTypes[def.name] = rt;
  }

  // ─────────────────────────────────────────────
  // 10. Rooms
  // ─────────────────────────────────────────────
  const roomDefs = [
    { number: '101', floor: 1, typeName: 'Deluxe Room', status: 'READY' },
    { number: '102', floor: 1, typeName: 'Deluxe Room', status: 'READY' },
    { number: '103', floor: 1, typeName: 'Deluxe Room', status: 'OCCUPIED' },
    { number: '201', floor: 2, typeName: 'Deluxe Room', status: 'READY' },
    { number: '202', floor: 2, typeName: 'Deluxe Room', status: 'DIRTY' },
    { number: '301', floor: 3, typeName: 'Junior Suite', status: 'READY' },
    { number: '401', floor: 4, typeName: 'Junior Suite', status: 'READY' },
    { number: '501', floor: 5, typeName: 'Presidential Suite', status: 'READY' },
  ];

  for (const def of roomDefs) {
    let room = await prisma.room.findFirst({
      where: { hotelId: hotel.id, number: def.number },
    });
    if (!room) {
      await prisma.room.create({
        data: {
          hotelId: hotel.id,
          roomTypeId: roomTypes[def.typeName].id,
          number: def.number,
          floor: def.floor,
          status: def.status,
          isActive: true,
        },
      });
      console.log(`  [+] Room created: ${def.number} (${def.typeName}, floor ${def.floor})`);
    }
  }

  // ─────────────────────────────────────────────
  // 11. Guests
  // ─────────────────────────────────────────────
  const guestDefs = [
    {
      firstName: 'Alem',
      lastName: 'Berhanu',
      email: 'alem.berhanu@email.com',
      phone: '+251-91-200-0001',
      gender: 'FEMALE',
      nationality: 'Ethiopian',
      isVip: true,
    },
    {
      firstName: 'Tadesse',
      lastName: 'Girma',
      email: 'tadesse.girma@email.com',
      phone: '+251-92-300-0002',
      gender: 'MALE',
      nationality: 'Ethiopian',
      isVip: false,
    },
    {
      firstName: 'Selam',
      lastName: 'Haile',
      email: 'selam.haile@email.com',
      phone: '+251-93-400-0003',
      gender: 'FEMALE',
      nationality: 'Ethiopian',
      isVip: false,
    },
  ];

  for (const def of guestDefs) {
    let guest = await prisma.guest.findFirst({
      where: { hotelId: hotel.id, email: def.email },
    });
    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          hotelId: hotel.id,
          firstName: def.firstName,
          lastName: def.lastName,
          email: def.email,
          phone: def.phone,
          gender: def.gender,
          nationality: def.nationality,
          isVip: def.isVip,
        },
      });
      console.log(`  [+] Guest created: ${guest.firstName} ${guest.lastName}`);
    }
  }

  // ─────────────────────────────────────────────
  // 12. Menu Categories & Items
  // ─────────────────────────────────────────────
  const categoryDefs = [
    { name: 'Starters', sortOrder: 0 },
    { name: 'Mains', sortOrder: 1 },
    { name: 'Desserts', sortOrder: 2 },
    { name: 'Drinks', sortOrder: 3 },
  ];

  const categories = {};
  for (const def of categoryDefs) {
    let cat = await prisma.category.findFirst({
      where: { hotelId: hotel.id, name: def.name },
    });
    if (!cat) {
      cat = await prisma.category.create({
        data: { hotelId: hotel.id, ...def },
      });
      console.log(`  [+] Menu Category created: ${cat.name}`);
    }
    categories[def.name] = cat;
  }

  const kitchenDept = departments['KITCHEN'];
  const barDept = departments['BAR'];

  // --- Starters ---
  const startersData = [
    {
      name: 'Sambusa Trio',
      description: 'Crisp pastry parcels filled with spiced lentils, served with mint chutney.',
      price: 4.5,
      dietaryTags: ['VEGETARIAN'],
      sortOrder: 0,
      departmentId: kitchenDept.id,
      customizationGroups: {
        create: [
          {
            name: 'Filling',
            isRequired: false,
            allowMultiple: true,
            options: {
              create: [
                { label: 'Lentil (default)', priceDelta: 0 },
                { label: 'Beef', priceDelta: 1.0 },
                { label: 'Chicken', priceDelta: 1.0 },
              ],
            },
          },
        ],
      },
    },
    {
      name: 'Kitfo Bites',
      description: 'Ethiopian spiced raw beef tartare on crispy bread with awaze sauce.',
      price: 6.0,
      dietaryTags: ['SPICY'],
      sortOrder: 1,
      departmentId: kitchenDept.id,
    },
    {
      name: 'Gomen Starter',
      description: 'Collard greens sautéed with garlic and ginger, served with injera crisps.',
      price: 3.5,
      dietaryTags: ['VEGETARIAN', 'GLUTEN_FREE'],
      sortOrder: 2,
      departmentId: kitchenDept.id,
    },
  ];

  for (const item of startersData) {
    const existing = await prisma.menuItem.findFirst({
      where: { categoryId: categories['Starters'].id, name: item.name },
    });
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          categoryId: categories['Starters'].id,
          name: item.name,
          description: item.description,
          price: item.price,
          isAvailable: true,
          dietaryTags: item.dietaryTags || [],
          sortOrder: item.sortOrder,
          departmentId: item.departmentId,
          customizationGroups: item.customizations || undefined,
        },
      });
      console.log(`  [+] Menu Item: ${item.name}`);
    }
  }

  // --- Mains ---
  const mainsData = [
    {
      name: 'Doro Wat',
      description: 'Slow-simmered chicken in berbere sauce, served with injera and hard-boiled egg.',
      price: 12.0,
      isChefSpecial: true,
      dietaryTags: ['SPICY'],
      sortOrder: 0,
      departmentId: kitchenDept.id,
      customizationGroups: {
        create: [
          {
            name: 'Spice Level',
            isRequired: true,
            allowMultiple: false,
            options: {
              create: [
                { label: 'Mild', priceDelta: 0 },
                { label: 'Medium', priceDelta: 0 },
                { label: 'Hot', priceDelta: 0 },
              ],
            },
          },
        ],
      },
    },
    {
      name: 'Tibs',
      description: 'Sautéed beef cubes with rosemary, jalapeños, and caramelized onions, served with injera.',
      price: 14.0,
      isChefSpecial: false,
      dietaryTags: ['SPICY'],
      sortOrder: 1,
      departmentId: kitchenDept.id,
      customizationGroups: {
        create: [
          {
            name: 'Meat Cut',
            isRequired: true,
            allowMultiple: false,
            options: {
              create: [
                { label: 'Lean', priceDelta: 0 },
                { label: 'With Fat', priceDelta: 0 },
              ],
            },
          },
        ],
      },
    },
    {
      name: 'Beyaynetu Platter',
      description: 'A colorful assortment of six traditional Ethiopian stews and vegetables on injera.',
      price: 10.0,
      isChefSpecial: false,
      dietaryTags: ['VEGETARIAN', 'GLUTEN_FREE'],
      sortOrder: 2,
      departmentId: kitchenDept.id,
    },
    {
      name: 'Grilled Tilapia',
      description: 'Whole grilled Nile tilapia with turmeric, served with atkilt wot and rice.',
      price: 16.0,
      isChefSpecial: true,
      dietaryTags: ['GLUTEN_FREE'],
      sortOrder: 3,
      departmentId: kitchenDept.id,
    },
  ];

  for (const item of mainsData) {
    const existing = await prisma.menuItem.findFirst({
      where: { categoryId: categories['Mains'].id, name: item.name },
    });
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          categoryId: categories['Mains'].id,
          name: item.name,
          description: item.description,
          price: item.price,
          isAvailable: true,
          isChefSpecial: item.isChefSpecial || false,
          dietaryTags: item.dietaryTags || [],
          sortOrder: item.sortOrder,
          departmentId: item.departmentId,
          customizationGroups: item.customizations || undefined,
        },
      });
      console.log(`  [+] Menu Item: ${item.name}`);
    }
  }

  // --- Desserts ---
  const dessertsData = [
    {
      name: 'Tehina Cake',
      description: 'Moist semolina cake soaked in honey Tehina syrup, topped with crushed pistachios.',
      price: 5.0,
      dietaryTags: ['VEGETARIAN'],
      sortOrder: 0,
      departmentId: kitchenDept.id,
    },
    {
      name: 'Dabo Kolo Parfait',
      description: 'Layered yogurt parfait with crunchy dabo kolo, honey, and fresh berries.',
      price: 4.5,
      dietaryTags: ['VEGETARIAN', 'GLUTEN_FREE'],
      sortOrder: 1,
      departmentId: kitchenDept.id,
    },
  ];

  for (const item of dessertsData) {
    const existing = await prisma.menuItem.findFirst({
      where: { categoryId: categories['Desserts'].id, name: item.name },
    });
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          categoryId: categories['Desserts'].id,
          name: item.name,
          description: item.description,
          price: item.price,
          isAvailable: true,
          dietaryTags: item.dietaryTags || [],
          sortOrder: item.sortOrder,
          departmentId: item.departmentId,
        },
      });
      console.log(`  [+] Menu Item: ${item.name}`);
    }
  }

  // --- Drinks ---
  const drinksData = [
    {
      name: 'Ethiopian Coffee Ceremony',
      description: 'Traditionally brewed coffee, roasted fresh to order. Single serve.',
      price: 3.0,
      dietaryTags: ['VEGAN', 'GLUTEN_FREE'],
      sortOrder: 0,
      departmentId: barDept.id,
    },
    {
      name: 'Honey Wine (Tej)',
      description: 'Traditional Ethiopian honey wine, sweet and aromatic. Served in a berele.',
      price: 7.0,
      dietaryTags: ['VEGAN'],
      sortOrder: 1,
      departmentId: barDept.id,
    },
    {
      name: 'Tropical Fruit Juice',
      description: 'Freshly squeezed blend of mango, papaya, and pineapple.',
      price: 4.0,
      dietaryTags: ['VEGAN', 'GLUTEN_FREE'],
      sortOrder: 2,
      departmentId: barDept.id,
    },
    {
      name: 'Local St. George Beer',
      description: 'Classic Ethiopian lager, crisp and refreshing. 330ml bottle.',
      price: 3.0,
      dietaryTags: ['VEGAN'],
      sortOrder: 3,
      departmentId: barDept.id,
    },
  ];

  for (const item of drinksData) {
    const existing = await prisma.menuItem.findFirst({
      where: { categoryId: categories['Drinks'].id, name: item.name },
    });
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          categoryId: categories['Drinks'].id,
          name: item.name,
          description: item.description,
          price: item.price,
          isAvailable: true,
          dietaryTags: item.dietaryTags || [],
          sortOrder: item.sortOrder,
          departmentId: item.departmentId,
        },
      });
      console.log(`  [+] Menu Item: ${item.name}`);
    }
  }

  // ─────────────────────────────────────────────
  // 13. Tables
  // ─────────────────────────────────────────────
  const tableNumbers = ['1', '2', '3', '4', '5', '6', '7', '8'];
  for (const num of tableNumbers) {
    let table = await prisma.table.findFirst({
      where: { hotelId: hotel.id, number: num },
    });
    if (!table) {
      table = await prisma.table.create({
        data: { hotelId: hotel.id, number: num },
      });
      console.log(`  [+] Table created: #${table.number}`);
    }
  }

  // ─────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────
  const totals = {
    hotel: await prisma.hotel.count({ where: { id: hotel.id } }),
    departments: await prisma.department.count({ where: { hotelId: hotel.id } }),
    roles: await prisma.role.count(),
    permissions: await prisma.permission.count(),
    rolePermissions: await prisma.rolePermission.count(),
    staff: await prisma.staff.count({ where: { hotelId: hotel.id } }),
    stations: await prisma.serviceStation.count({ where: { hotelId: hotel.id } }),
    locations: await prisma.location.count({ where: { hotelId: hotel.id } }),
    roomTypes: await prisma.roomType.count({ where: { hotelId: hotel.id } }),
    rooms: await prisma.room.count({ where: { hotelId: hotel.id } }),
    guests: await prisma.guest.count({ where: { hotelId: hotel.id } }),
    categories: await prisma.category.count({ where: { hotelId: hotel.id } }),
    menuItems: await prisma.menuItem.count({
      where: { category: { hotelId: hotel.id } },
    }),
    tables: await prisma.table.count({ where: { hotelId: hotel.id } }),
  };

  console.log('');
  console.log('='.repeat(60));
  console.log('  SEED COMPLETE');
  console.log('='.repeat(60));
  console.log('');
  console.log('  Database totals:');
  console.log(`    Hotel:          ${totals.hotel}`);
  console.log(`    Departments:    ${totals.departments}`);
  console.log(`    Roles:          ${totals.roles}`);
  console.log(`    Permissions:    ${totals.permissions}`);
  console.log(`    Role-Perms:     ${totals.rolePermissions}`);
  console.log(`    Staff:          ${totals.staff}`);
  console.log(`    Stations:       ${totals.stations}`);
  console.log(`    Locations:      ${totals.locations}`);
  console.log(`    Room Types:     ${totals.roomTypes}`);
  console.log(`    Rooms:          ${totals.rooms}`);
  console.log(`    Guests:         ${totals.guests}`);
  console.log(`    Menu Categories:${totals.categories}`);
  console.log(`    Menu Items:     ${totals.menuItems}`);
  console.log(`    Tables:         ${totals.tables}`);
  console.log('');
  console.log('  Staff credentials:');
  console.log(`    Owner:          ${ownerEmail} / ${ownerPassword}`);
  console.log(`    General Manager: manager@adama-hotel.com / Manager123!`);
  console.log(`    Front Desk:     frontdesk@adama-hotel.com / Front123!`);
  console.log(`    Chef:           chef@adama-hotel.com / Chef123!`);
  console.log(`    Housekeeping:   housekeeping@adama-hotel.com / House123!`);
  console.log(`    Waiter:         waiter@adama-hotel.com / Wait123!`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('');
    console.error('  SEED FAILED:');
    console.error('  ', e.message);
    if (e.meta) console.error('  ', e.meta);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
