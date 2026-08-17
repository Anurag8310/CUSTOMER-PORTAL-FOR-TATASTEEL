/**
 * Tata Steel Customer Portal - Initial Seed Data Repository
 * Uses User-Provided Product Images
 */

window.TATA_SEED_DATA = {
  users: [
    {
      id: "usr_01",
      customerCode: "TS-LNT-2026",
      name: "Rajesh Sharma",
      email: "r.sharma@lntinfra.com",
      phone: "+91 98200 11223",
      company: "L&T Construction (Infra Division)",
      role: "Procurement Head",
      segment: "Infrastructure & Civil",
      location: "Mumbai Port Trust Expansion",
      gstin: "27AAACL1234F1Z5",
      passwordHash: "lnt@1234"
    },
    {
      id: "usr_02",
      customerCode: "TS-TML-2026",
      name: "Anish Kulkarni",
      email: "a.kulkarni@tatamotors.com",
      phone: "+91 98111 44556",
      company: "Tata Motors Ltd (Auto OEM)",
      role: "Supply Chain Manager",
      segment: "Automotive OEM",
      location: "Pune Vehicle Assembly Plant",
      gstin: "27AAACT5678G2Z1",
      passwordHash: "tml@1234"
    }
  ],

  products: [
    {
      id: "prod_01",
      name: "Tata Tiscon 550D Rebars",
      category: "Rebars",
      specifications: "IS 1786:2008 Fe 550D High Ductility",
      grades: ["Fe 550D", "Fe 500D", "Fe 600"],
      availableSizes: ["8mm", "10mm", "12mm", "16mm", "20mm", "25mm", "32mm"],
      basePricePerTon: 58500,
      description: "High yield strength TMT rebar for mega infrastructure, bridges, and earthquake-resistant structures.",
      tagline: "India's leading high-ductility TMT rebars for resilient civil structures.",
      image: "images/Tata Tiscon 550D Rebars.webp"
    },
    {
      id: "prod_02",
      name: "Tata Astrum HR Coils & Sheets",
      category: "Flat Products",
      specifications: "IS 2062 E250 / E350 Structural Steel",
      grades: ["IS 2062 E250", "IS 2062 E350", "SAILMA 350HI"],
      availableSizes: ["2.0mm", "3.0mm", "5.0mm", "8.0mm", "10.0mm", "12.0mm"],
      basePricePerTon: 54200,
      description: "Hot Rolled coils and sheets for heavy engineering, yellow goods, and industrial fabrication.",
      tagline: "Superior flatness and dimensional consistency for heavy engineering.",
      image: "images/tata astrum hr coils and sheets.png"
    },
    {
      id: "prod_03",
      name: "Tata Steelium CR Coils",
      category: "Flat Products",
      specifications: "IS 513 CR1 / CR2 Deep Drawing Grade",
      grades: ["CR1 Deep Draw", "CR2 Extra Deep Draw", "EDD Standard"],
      availableSizes: ["0.6mm", "0.8mm", "1.0mm", "1.2mm", "1.6mm", "2.0mm"],
      basePricePerTon: 62800,
      description: "Cold Rolled close annealed steel for automotive outer panels, appliances, and precision tubes.",
      tagline: "Exceptional surface finish for automotive body panels and appliances.",
      image: "images/Tata Steelium CR Coils.jpg"
    },
    {
      id: "prod_04",
      name: "Tata Structura Hollow Sections",
      category: "Structural",
      specifications: "IS 4923 YST 310 Square & Rectangular Tubes",
      grades: ["YST 310", "YST 240", "YST 355"],
      availableSizes: ["50x50mm", "80x80mm", "100x100mm", "150x150mm", "200x200mm"],
      basePricePerTon: 61000,
      description: "Structural hollow sections for airport terminals, stadia, and modern architectural frameworks.",
      tagline: "High strength-to-weight ratio structural steel for iconic architecture.",
      image: "images/Tata Structura Hollow Sections.jpg"
    }
  ],

  orders: [
    {
      id: "ORD-LNT-9817",
      userId: "usr_01",
      orderDate: "2026-07-15",
      productName: "Tata Tiscon 550D",
      productId: "prod_01",
      grade: "Fe 550D",
      size: "16mm",
      tonnage: 450,
      baseRatePerTon: 58500,
      freightPerTon: 2400,
      gstPercent: 18,
      totalAmount: 32305500,
      plant: "Jamshedpur Steel Works",
      dispatchStatus: "In-Transit",
      expectedDelivery: "2026-07-30",
      heatNumber: "HT-2026-8987",
      dispatchMethod: "Rake Freight (Indian Railways)"
    },
    {
      id: "ORD-LNT-9818",
      userId: "usr_01",
      orderDate: "2026-07-20",
      productName: "Tata Structura Hollow Sections",
      productId: "prod_04",
      grade: "YST 310",
      size: "100x100mm",
      tonnage: 120,
      baseRatePerTon: 61000,
      freightPerTon: 2100,
      gstPercent: 18,
      totalAmount: 8934960,
      plant: "Meramandali Works",
      dispatchStatus: "Delivered",
      expectedDelivery: "2026-07-25",
      heatNumber: "HT-2026-9902",
      dispatchMethod: "Trailer Logistics"
    },
    {
      id: "ORD-TML-4412",
      userId: "usr_02",
      orderDate: "2026-07-18",
      productName: "Tata Steelium CR Coils",
      productId: "prod_03",
      grade: "CR1 Deep Draw",
      size: "1.2mm x 1250mm",
      tonnage: 300,
      baseRatePerTon: 62800,
      freightPerTon: 2800,
      gstPercent: 18,
      totalAmount: 23222400,
      plant: "Kalinganagar Plant",
      dispatchStatus: "In-Transit",
      expectedDelivery: "2026-08-02",
      heatNumber: "HT-2026-7734",
      dispatchMethod: "Dedicated Freight Corridor Rake"
    }
  ],

  rfqs: [
    {
      id: "RFQ-LNT-102",
      userId: "usr_01",
      productName: "Tata Tiscon 550D",
      grade: "Fe 550D",
      size: "25mm",
      quantityTons: 800,
      destinationCity: "Mumbai Port Terminal",
      estimatedBasePrice: 58500,
      totalEstimatedCost: 57348000,
      validUntil: "2026-08-10"
    }
  ],

  dispatches: [
    {
      orderId: "ORD-LNT-9817",
      trackingNumber: "WB-RAKE-2026-8891",
      transitMode: "Railway Rake #TATA-88",
      carrier: "Indian Railways (South Eastern Zone)",
      origin: "Jamshedpur Works Siding",
      destination: "Mumbai Wadala Goods Yard",
      currentLocation: "Tatanagar Freight Terminal",
      speedKmh: 52,
      driverOrMaster: "Master Loco Pilot R. K. Varma",
      progressPercent: 65,
      status: "In-Transit",
      lastUpdate: "10 mins ago",
      milestones: [
        { status: "Rake Loaded & Weighed at Mill", location: "Jamshedpur Steel Works", time: "15 Jul 2026, 08:30 AM", completed: true },
        { status: "NABL Inspection & MTC Verified", location: "Quality Control Lab 4", time: "15 Jul 2026, 11:15 AM", completed: true },
        { status: "Railway Waybill Issued", location: "Tatanagar Junction", time: "15 Jul 2026, 02:45 PM", completed: true },
        { status: "En Route Freight Corridor", location: "Bilaspur Goods Loop", time: "18 Jul 2026, 06:10 AM", active: true, completed: false },
        { status: "Destination Siding Arrival", location: "Mumbai Wadala Yard", time: "Est. 30 Jul 2026", completed: false }
      ]
    },
    {
      orderId: "ORD-TML-4412",
      trackingNumber: "WB-TRL-2026-7734",
      transitMode: "Heavy Multi-Axle Trailer",
      carrier: "Tata NYK Shipping & Logistics",
      origin: "Kalinganagar Plant Siding",
      destination: "Pune Assembly Gate 3",
      currentLocation: "Visakhapatnam Bypass Checkpoint",
      speedKmh: 42,
      driverOrMaster: "Driver Suresh Patil",
      progressPercent: 40,
      status: "In-Transit",
      lastUpdate: "25 mins ago",
      milestones: [
        { status: "Coil Strapped & Inspected", location: "Kalinganagar CRM Mill", time: "18 Jul 2026, 10:00 AM", completed: true },
        { status: "Gate Out & GPS Sealed", location: "Kalinganagar Plant Gate 2", time: "18 Jul 2026, 01:20 PM", completed: true },
        { status: "Highway Transit", location: "NH-16 Coastal Corridor", time: "21 Jul 2026, 04:00 PM", active: true, completed: false },
        { status: "Factory Gate Entry", location: "Pune Assembly Plant", time: "Est. 02 Aug 2026", completed: false }
      ]
    }
  ],

  certificates: [
    {
      heatNumber: "HT-2026-8987",
      orderId: "ORD-L&T-9817",
      productName: "Tata Tiscon 550D",
      grade: "Fe 550D",
      size: "16mm",
      testDate: "2026-07-28",
      plant: "Jamshedpur Steel Works",
      certificateStatus: "Certified & Verified",
      qaInspector: "Er. V. K. Tata (Quality Director)",
      qrCodeHash: "TATA-MTC-HT-2026-8987-HASH-456572",
      chemicalAnalysis: {
        carbon: 0.202,
        manganese: 1.18,
        sulphur: 0.022,
        phosphorus: 0.026,
        sulphurPhos: 0.045,
        carbonEquiv: 0.38
      },
      mechanicalProperties: {
        yieldStrength: 557,
        tensileStrength: 657,
        tsYsRatio: 1.14,
        elongation: 19.2,
        bendTest: "PASSED (180° Mandrel Test)",
        rebendTest: "PASSED"
      }
    },
    {
      heatNumber: "HT-2026-9902",
      orderId: "ORD-LNT-9818",
      productName: "Tata Structura Hollow Sections",
      grade: "YST 310",
      size: "100x100mm",
      testDate: "2026-07-20",
      plant: "Meramandali Works",
      certificateStatus: "Certified & Verified",
      qaInspector: "Er. V. K. Tata (Quality Director)",
      qrCodeHash: "TATA-MTC-HT-2026-9902-HASH-981244",
      chemicalAnalysis: {
        carbon: 0.175,
        manganese: 1.12,
        sulphur: 0.018,
        phosphorus: 0.021,
        sulphurPhos: 0.039,
        carbonEquiv: 0.35
      },
      mechanicalProperties: {
        yieldStrength: 335,
        tensileStrength: 465,
        tsYsRatio: 1.38,
        elongation: 24.5,
        bendTest: "PASSED",
        rebendTest: "PASSED"
      }
    },
    {
      heatNumber: "HT-2026-7734",
      orderId: "ORD-TML-4412",
      productName: "Tata Steelium CR Coils",
      grade: "CR1 Deep Draw",
      size: "1.2mm x 1250mm",
      testDate: "2026-07-18",
      plant: "Kalinganagar Plant",
      certificateStatus: "Certified & Verified",
      qaInspector: "Er. S. R. Rao (Chief QA Officer)",
      qrCodeHash: "TATA-MTC-HT-2026-7734-HASH-774102",
      chemicalAnalysis: {
        carbon: 0.075,
        manganese: 0.38,
        sulphur: 0.012,
        phosphorus: 0.015,
        sulphurPhos: 0.027,
        carbonEquiv: 0.14
      },
      mechanicalProperties: {
        yieldStrength: 215,
        tensileStrength: 320,
        tsYsRatio: 1.48,
        elongation: 38.0,
        bendTest: "PASSED (Flat Bend Test)",
        rebendTest: "PASSED"
      }
    }
  ],

  offices: [
    {
      city: "Jamshedpur",
      type: "Primary Works & Registered HQ",
      address: "Tata Steel Limited, Main Gate, Bistupur, Jamshedpur - 831001, Jharkhand",
      phone: "+91 657 242 6821 / 243 1234",
      email: "jamshedpur.sales@tatasteel.com"
    },
    {
      city: "Kalinganagar",
      type: "Flat Products Steel Plant",
      address: "Kalinganagar Industrial Complex, Duburi, Jajpur - 755026, Odisha",
      phone: "+91 6726 27 0000",
      email: "kalinganagar.sales@tatasteel.com"
    },
    {
      city: "Mumbai",
      type: "Commercial HQ & Western Sales",
      address: "Bombay House, 24 Homi Mody Street, Fort, Mumbai - 400001, Maharashtra",
      phone: "+91 22 6665 8282",
      email: "mumbai.sales@tatasteel.com"
    },
    {
      city: "Delhi NCR",
      type: "Northern Regional Sales Office",
      address: "Express Building, 9-10 Bahadur Shah Zafar Marg, New Delhi - 110002",
      phone: "+91 11 2331 4321",
      email: "delhi.sales@tatasteel.com"
    },
    {
      city: "Bengaluru",
      type: "Southern Regional Sales Office",
      address: "Residency Road, Shanthala Nagar, Ashok Nagar, Bengaluru - 560025",
      phone: "+91 80 6622 0000",
      email: "south.sales@tatasteel.com"
    },
    {
      city: "Kolkata",
      type: "Eastern Regional Sales Office",
      address: "Tata Centre, 43 Jawaharlal Nehru Road, Kolkata - 700071, West Bengal",
      phone: "+91 33 2288 7000",
      email: "east.sales@tatasteel.com"
    }
  ],

  sustainabilityMetrics: {
    co2SavedTonnesTotal: 142500,
    scrapRecycledPercent: 27.5,
    greenHydrogenPilotCoverage: "Jamshedpur Blast Furnace #E"
  }
};
