/**
 * ============================================================================
 * Inside Indus - Central Campus Data Store (data.js)
 * Tagline: "Built by students for students"
 * Institution: Indus University
 * 
 * IMPORTANT COMPLIANCE RULES:
 * 1. No fake information is used.
 * 2. If information is unknown, display "Information coming soon".
 * 3. Never invent room numbers, directions, walking times, or door positions.
 * 4. B201 is NOT classified as a Lecture Hall, Laboratory, or Classroom.
 *    Room type: "Information coming soon" | AC/Non-AC: Non-AC (confirmed).
 * 5. EV Charging Station and Sports facilities are visual map references ONLY,
 *    and NOT searchable destinations.
 * 6. Free classrooms are only shown if an availability entry has been submitted.
 * 7. Faculty email addresses are NOT invented (optional email: null).
 * 8. LH-4 is in Main Building (MB), Ground Floor.
 * 9. Stairs only - NO lifts in the navigation system.
 * ============================================================================
 */

// Karma Points configuration (Easy to adjust)
const KARMA_POINTS_CONFIG = {
  FREE_SUBMISSION: 5,  // Points awarded for submitting a free classroom
  OCCUPIED_REPORT: 3   // Points awarded for reporting a room as occupied
};

// Default verified campus dataset
const DEFAULT_CAMPUS_DATA = {
  // Confirmed campus buildings
  buildings: [
    {
      id: "MB",
      code: "MB",
      name: "Main Building",
      totalFloors: "4 Floors (Basement to 2nd Floor)",
      description: "Central campus building housing the university auditorium, library, and administration office.",
      knownFacilities: [
        "Auditorium (Basement)",
        "Central Library (2nd Floor)",
        "Administration Office (Floor: Information coming soon)",
        "LH-4 (Ground Floor) — Lecture Hall, AC"
      ],
      knownFloors: [
        { floor: "Basement", locations: ["Auditorium"] },
        { floor: "Ground Floor", locations: ["LH-4"] },
        { floor: "1st Floor", locations: ["Information coming soon"] },
        { floor: "2nd Floor", locations: ["Central Library"] }
      ],
      knownLocations: [
        "Basement: Auditorium",
        "Ground Floor: LH-4 (Lecture Hall, AC)",
        "2nd Floor: Library",
        "Administration Office: Main Building (Exact floor: Information coming soon)"
      ]
    },
    {
      id: "BB",
      code: "BB",
      name: "Bhanwan Building",
      totalFloors: "5 Floors",
      description: "Five-story academic building containing lecture halls, faculty spaces, and laboratory facilities. Stairs available (exact staircase positions: Information coming soon).",
      knownFacilities: [
        "Lecture Halls (1st, 3rd, 5th Floors)",
        "Laboratories (1st, 2nd, 4th Floors)",
        "Faculty Offices (2nd Floor: B201 — Ms. Palak Shah)"
      ],
      knownFloors: [
        { floor: "1st Floor", locations: ["LH-14", "LH-102", "LH-101", "LH-12", "LAB-128"] },
        { floor: "2nd Floor", locations: ["B201", "LAB-B227"] },
        { floor: "3rd Floor", locations: ["LH-27"] },
        { floor: "4th Floor", locations: ["LAB-4"] },
        { floor: "5th Floor", locations: ["LH-B526"] }
      ],
      knownLocations: [
        "1st Floor: LH-14, LH-102, LH-101, LH-12, LAB-128",
        "2nd Floor: B201 (Ms. Palak Shah office), LAB-B227",
        "3rd Floor: LH-27",
        "4th Floor: LAB-4",
        "5th Floor: LH-B526",
        "More locations coming soon"
      ]
    }
  ],

  // Confirmed Classrooms / Lecture Halls
  classrooms: [
    {
      id: "LH-4",
      name: "LH-4",
      building: "Main Building (MB)",
      buildingCode: "MB",
      floor: "Ground Floor",
      type: "Lecture Hall",
      airConditioned: true,
      direction: "Upcoming",
      notes: "Ground floor lecture hall in Main Building (MB) with air conditioning."
    },
    {
      id: "LH-14",
      name: "LH-14",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "1st Floor",
      type: "Lecture Hall",
      airConditioned: true,
      direction: "Upcoming",
      notes: "First floor lecture hall in Bhanwan Building (BB) with air conditioning."
    },
    {
      id: "LH-102",
      name: "LH-102",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "1st Floor",
      type: "Lecture Hall",
      airConditioned: false,
      direction: "Upcoming",
      notes: "First floor lecture hall in Bhanwan Building (BB) without air conditioning (Non-AC)."
    },
    {
      id: "LH-101",
      name: "LH-101",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "1st Floor",
      type: "Lecture Hall",
      airConditioned: false,
      direction: "Upcoming",
      notes: "First floor lecture hall in Bhanwan Building (BB) without air conditioning (Non-AC)."
    },
    {
      id: "LH-12",
      name: "LH-12",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "1st Floor",
      type: "Lecture Hall",
      airConditioned: true,
      direction: "Upcoming",
      notes: "First floor lecture hall in Bhanwan Building (BB) with air conditioning."
    },
    {
      id: "LH-27",
      name: "LH-27",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "3rd Floor",
      type: "Lecture Hall",
      airConditioned: true,
      direction: "Upcoming",
      notes: "Third floor lecture hall in Bhanwan Building (BB) with air conditioning."
    },
    {
      id: "LH-B526",
      name: "LH-B526",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "5th Floor",
      type: "Lecture Hall",
      airConditioned: false,
      direction: "Upcoming",
      notes: "Fifth floor lecture hall in Bhanwan Building (BB) without air conditioning (Non-AC)."
    }
  ],

  // Special Unverified Academic Rooms (CRITICAL RULE: DO NOT classify as LH, LAB, or Classroom)
  specialRooms: [
    {
      id: "B201",
      name: "B201",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "2nd Floor",
      type: "Information coming soon",
      airConditioned: false,
      associatedWith: "Ms. Palak Shah",
      notes: "B201 is associated with Ms. Palak Shah. Room type has not been officially verified. Non-AC."
    }
  ],

  // Confirmed Laboratories
  labs: [
    {
      id: "LAB-128",
      name: "LAB-128",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "1st Floor",
      type: "Laboratory",
      airConditioned: true,
      direction: "Upcoming",
      notes: "First floor laboratory in Bhanwan Building (BB) with air conditioning."
    },
    {
      id: "LAB-B227",
      name: "LAB-B227",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "2nd Floor",
      type: "Laboratory",
      airConditioned: true,
      direction: "Upcoming",
      notes: "Second floor laboratory in Bhanwan Building (BB) with air conditioning."
    },
    {
      id: "LAB-4",
      name: "LAB-4",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "4th Floor",
      type: "Laboratory",
      airConditioned: true,
      direction: "Upcoming",
      notes: "Fourth floor laboratory in Bhanwan Building (BB) with air conditioning."
    }
  ],

  // Confirmed Faculty Members (Only verified office data is included; emails are optional null)
  faculty: [
    {
      id: "FAC-1",
      name: "Dr. Rootvesh Mehta",
      department: "Information coming soon",
      email: null,
      office: "Information coming soon",
      building: "Information coming soon",
      floor: "Information coming soon",
      room: "Information coming soon",
      notes: "Faculty member at Indus University. Official office details coming soon."
    },
    {
      id: "FAC-2",
      name: "Ms. Palak Shah",
      department: "Information coming soon",
      email: null,
      office: "B201",
      building: "Bhanwan Building (BB)",
      floor: "2nd Floor",
      room: "B201",
      notes: "Confirmed office in Bhanwan Building (BB), 2nd Floor, Room B201. Non-AC."
    },
    {
      id: "FAC-3",
      name: "Ms. Rupal Kharya",
      department: "Information coming soon",
      email: null,
      office: "Information coming soon",
      building: "Information coming soon",
      floor: "Information coming soon",
      room: "Information coming soon",
      notes: "Faculty member at Indus University. Official office details coming soon."
    },
    {
      id: "FAC-4",
      name: "Ms. Zarna Kotak",
      department: "Information coming soon",
      email: null,
      office: "Information coming soon",
      building: "Information coming soon",
      floor: "Information coming soon",
      room: "Information coming soon",
      notes: "Faculty member at Indus University. Official office details coming soon."
    },
    {
      id: "FAC-5",
      name: "Ms. Vrushali Rajvanshi",
      department: "Information coming soon",
      email: null,
      office: "Information coming soon",
      building: "Information coming soon",
      floor: "Information coming soon",
      room: "Information coming soon",
      notes: "Faculty member at Indus University. Official office details coming soon."
    },
    {
      id: "FAC-6",
      name: "Ms. Lakshmi Kiran Gadde",
      department: "Information coming soon",
      email: null,
      office: "Information coming soon",
      building: "Information coming soon",
      floor: "Information coming soon",
      room: "Information coming soon",
      notes: "Faculty member at Indus University. Official office details coming soon."
    }
  ],

  // Confirmed Campus Facilities
  facilities: [
    {
      id: "FACILITY-LIB",
      name: "Library",
      category: "Library",
      building: "Main Building (MB)",
      buildingCode: "MB",
      floor: "2nd Floor",
      type: "University Library",
      direction: "Upcoming",
      description: "Central campus library offering quiet study areas, reference collections, and academic resources."
    },
    {
      id: "FACILITY-AUD",
      name: "Auditorium",
      category: "Auditorium",
      building: "Main Building (MB)",
      buildingCode: "MB",
      floor: "Basement",
      type: "Campus Auditorium",
      direction: "Upcoming",
      description: "Main auditorium for university convocations, guest lectures, student cultural activities, and seminars."
    },
    {
      id: "FACILITY-ADM",
      name: "Administration Office",
      category: "Offices",
      building: "Main Building (MB)",
      buildingCode: "MB",
      floor: "Information coming soon",
      type: "Administration Office",
      direction: "Upcoming",
      description: "University administration office handling student inquiries, registrations, and official matters."
    },
    {
      id: "FACILITY-CAN",
      name: "Student Canteen",
      category: "Canteen",
      building: "Near Tree Sitting",
      buildingCode: "OUTDOOR",
      floor: "Ground Level",
      type: "Campus Canteen",
      direction: "Upcoming",
      description: "Primary student canteen offering breakfast, lunch, tea, and snacks. Located near Tree Sitting area."
    }
  ],

  // Approved Searchable Food / Cafe Places & Landmarks
  foodCafes: [
    {
      id: "FOOD-1",
      name: "Cafeteria Indus University",
      type: "Food & Beverage",
      location: "Campus Food Court",
      direction: "Upcoming",
      description: "Central campus cafeteria providing hot meals, thali options, snacks, and beverages for students and staff."
    },
    {
      id: "FOOD-2",
      name: "K K Coffee Bar",
      type: "Food & Beverage",
      location: "Campus Food Zone",
      direction: "Upcoming",
      description: "Coffee bar offering brewed coffees, chilled cold coffees, sandwiches, and refreshments."
    },
    {
      id: "FOOD-3",
      name: "The Dream Cafe",
      type: "Food & Beverage",
      location: "Campus Food Zone",
      direction: "Upcoming",
      description: "Modern campus cafe serving light bites, shakes, beverages, and student snacks."
    },
    {
      id: "FOOD-4",
      name: "Nescafe",
      type: "Food & Beverage",
      location: "Campus Kiosk",
      direction: "Upcoming",
      description: "Campus beverage kiosk serving classic Nescafe coffee, tea, Maggi noodles, and quick snacks."
    },
    {
      id: "FOOD-5",
      name: "Tea Post",
      type: "Food & Beverage",
      location: "Campus Food Zone",
      direction: "Upcoming",
      description: "Desi tea outlet offering freshly brewed chai, samosas, puff, and Indian snacks."
    },
    {
      id: "LM-TREE",
      name: "Tree Sitting",
      type: "Campus Landmark",
      location: "Central Campus (Near Canteen)",
      direction: "Upcoming",
      description: "Central shaded outdoor student seating area surrounded by trees. A popular campus meeting and study landmark."
    },
    {
      id: "LM-GATE",
      name: "Main Gate",
      type: "Campus Landmark",
      location: "Campus Entrance",
      direction: "Upcoming",
      description: "Main entrance gate of Indus University campus."
    },
    {
      id: "LM-PARKING",
      name: "Faculty Car Parking",
      type: "Campus Landmark",
      location: "Near Main Gate",
      direction: "Upcoming",
      description: "Faculty and staff car parking area near the main campus gate."
    }
  ],

  // Initial Sample Free Classroom Submissions (Stored in localStorage)
  // Per requirement: Only rooms with submitted availability are shown as free.
  freeRoomSubmissions: [
    {
      id: "SUB-1",
      roomId: "LH-14",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "1st Floor",
      date: "02 October 2026",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      status: "Available",
      submittedBy: "Student Contributor",
      reportedOccupied: false,
      occupiedReportsCount: 0
    },
    {
      id: "SUB-2",
      roomId: "LH-27",
      building: "Bhanwan Building (BB)",
      buildingCode: "BB",
      floor: "3rd Floor",
      date: "02 October 2026",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      status: "Available",
      submittedBy: "Student Contributor",
      reportedOccupied: false,
      occupiedReportsCount: 0
    }
  ],

  // Faculty Appointments (stored in localStorage via STORAGE_KEYS.APPOINTMENTS)
  appointments: []
};

// Storage Key Constants (Separated keys as per specification)
const STORAGE_KEYS = {
  DATA: "inside_indus_data",
  CLASSROOMS: "inside_indus_classrooms",
  LABS: "inside_indus_labs",
  FACULTY: "inside_indus_faculty",
  FACILITIES: "inside_indus_facilities",
  ADMIN_AUTH: "inside_indus_admin_auth",
  THEME: "inside_indus_theme",
  KARMA: "inside_indus_karma",
  FREE_ROOMS: "inside_indus_free_rooms",
  APPOINTMENTS: "inside_indus_appointments",
  FAVORITES: "inside_indus_favorites",
  RECENT_SEARCHES: "inside_indus_recent_searches"
};

/**
 * Loads campus data from localStorage using separated keys,
 * preserving any existing legacy data or initializing from DEFAULT_CAMPUS_DATA.
 */
function getCampusData() {
  try {
    // 1. Check legacy combined data first to avoid losing any existing user additions
    let legacyData = null;
    try {
      const rawLegacy = localStorage.getItem(STORAGE_KEYS.DATA) || localStorage.getItem("campus_go_data");
      if (rawLegacy) {
        legacyData = JSON.parse(rawLegacy);
      }
    } catch (e) {}

    // 2. Read separated keys with fallback to legacy or default
    let classrooms = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
      if (raw) classrooms = JSON.parse(raw);
    } catch (e) {}
    if (!classrooms || !Array.isArray(classrooms)) {
      classrooms = (legacyData && Array.isArray(legacyData.classrooms)) ? legacyData.classrooms : DEFAULT_CAMPUS_DATA.classrooms;
      try { localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms)); } catch (e) {}
    }
    // Ensure all classrooms have a valid direction field (default: "Upcoming")
    classrooms = classrooms.map(c => {
      if (!c.direction) c.direction = "Upcoming";
      return c;
    });

    let labs = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LABS);
      if (raw) labs = JSON.parse(raw);
    } catch (e) {}
    if (!labs || !Array.isArray(labs)) {
      labs = (legacyData && Array.isArray(legacyData.labs)) ? legacyData.labs : DEFAULT_CAMPUS_DATA.labs;
      try { localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(labs)); } catch (e) {}
    }
    // Ensure all labs have a valid direction field (default: "Upcoming")
    labs = labs.map(l => {
      if (!l.direction) l.direction = "Upcoming";
      return l;
    });

    let faculty = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FACULTY);
      if (raw) faculty = JSON.parse(raw);
    } catch (e) {}
    if (!faculty || !Array.isArray(faculty)) {
      faculty = (legacyData && Array.isArray(legacyData.faculty)) ? legacyData.faculty : DEFAULT_CAMPUS_DATA.faculty;
      try { localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(faculty)); } catch (e) {}
    }

    let facilities = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FACILITIES);
      if (raw) facilities = JSON.parse(raw);
    } catch (e) {}
    if (!facilities || !Array.isArray(facilities)) {
      facilities = (legacyData && Array.isArray(legacyData.facilities)) ? legacyData.facilities : DEFAULT_CAMPUS_DATA.facilities;
      try { localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities)); } catch (e) {}
    }
    // Ensure all facilities have a valid direction field (default: "Upcoming")
    facilities = facilities.map(f => {
      if (!f.direction) f.direction = "Upcoming";
      return f;
    });

    let freeRoomSubmissions = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FREE_ROOMS);
      if (raw) freeRoomSubmissions = JSON.parse(raw);
    } catch (e) {}
    if (!freeRoomSubmissions || !Array.isArray(freeRoomSubmissions)) {
      freeRoomSubmissions = (legacyData && Array.isArray(legacyData.freeRoomSubmissions)) ? legacyData.freeRoomSubmissions : DEFAULT_CAMPUS_DATA.freeRoomSubmissions;
      try { localStorage.setItem(STORAGE_KEYS.FREE_ROOMS, JSON.stringify(freeRoomSubmissions)); } catch (e) {}
    }

    let appointments = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (raw) appointments = JSON.parse(raw);
    } catch (e) {}
    if (!appointments || !Array.isArray(appointments)) {
      appointments = (legacyData && Array.isArray(legacyData.appointments)) ? legacyData.appointments : [];
      try { localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments)); } catch (e) {}
    }

    const compiledData = {
      buildings: DEFAULT_CAMPUS_DATA.buildings,
      classrooms,
      specialRooms: DEFAULT_CAMPUS_DATA.specialRooms,
      labs,
      faculty,
      facilities,
      foodCafes: DEFAULT_CAMPUS_DATA.foodCafes,
      freeRoomSubmissions,
      appointments
    };

    // Keep legacy key synchronized for safety
    try {
      localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(compiledData));
    } catch (e) {}

    return compiledData;
  } catch (err) {
    console.warn("Could not load data from localStorage, falling back to default.", err);
    return JSON.parse(JSON.stringify(DEFAULT_CAMPUS_DATA));
  }
}

/**
 * Saves current campus data state to localStorage across separated keys.
 */
function saveCampusData(data) {
  try {
    if (!data) return;
    if (data.classrooms) {
      localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(data.classrooms));
    }
    if (data.labs) {
      localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(data.labs));
    }
    if (data.faculty) {
      localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(data.faculty));
    }
    if (data.facilities) {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(data.facilities));
    }
    if (data.freeRoomSubmissions) {
      localStorage.setItem(STORAGE_KEYS.FREE_ROOMS, JSON.stringify(data.freeRoomSubmissions));
    }
    if (data.appointments) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
    }
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
  } catch (err) {
    console.error("Could not save campus data to localStorage:", err);
  }
}

/**
 * Resets campus data back to verified Indus University defaults.
 */
function resetCampusDataToDefaults() {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(DEFAULT_CAMPUS_DATA.classrooms));
    localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(DEFAULT_CAMPUS_DATA.labs));
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(DEFAULT_CAMPUS_DATA.faculty));
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(DEFAULT_CAMPUS_DATA.facilities));
    localStorage.setItem(STORAGE_KEYS.FREE_ROOMS, JSON.stringify(DEFAULT_CAMPUS_DATA.freeRoomSubmissions));
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(DEFAULT_CAMPUS_DATA));
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_CAMPUS_DATA));
}

/**
 * Retrieves the student's current Karma Points.
 */
function getKarmaPoints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KARMA);
    if (raw === null || raw === undefined || raw === "") return 0;
    const val = parseInt(raw, 10);
    return isNaN(val) ? 0 : val;
  } catch (e) {
    return 0;
  }
}

/**
 * Awards Karma Points and saves to localStorage.
 */
function awardKarmaPoints(amount) {
  const pts = parseInt(amount, 10) || 0;
  const current = getKarmaPoints();
  const updated = current + pts;
  try {
    localStorage.setItem(STORAGE_KEYS.KARMA, updated.toString());
  } catch (e) {
    console.warn("Could not save Karma points", e);
  }
  return updated;
}

/**
 * Gets all stored appointments from localStorage.
 */
function getAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Saves an appointment to localStorage.
 */
function saveAppointment(appointment) {
  try {
    const existing = getAppointments();
    existing.unshift(appointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(existing));
    return true;
  } catch (e) {
    console.error("Could not save appointment:", e);
    return false;
  }
}

// Make accessible to all browser scripts
window.KARMA_POINTS_CONFIG = KARMA_POINTS_CONFIG;
window.DEFAULT_CAMPUS_DATA = DEFAULT_CAMPUS_DATA;
window.STORAGE_KEYS = STORAGE_KEYS;
window.getCampusData = getCampusData;
window.saveCampusData = saveCampusData;
window.resetCampusDataToDefaults = resetCampusDataToDefaults;
window.getKarmaPoints = getKarmaPoints;
window.awardKarmaPoints = awardKarmaPoints;
window.getAppointments = getAppointments;
window.saveAppointment = saveAppointment;
