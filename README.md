# Inside Indus 📍
> **"Built by students for students"**  
> *The Smart Campus Navigation & Discovery Web Application for Indus University*

[![Tech](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue)](/)
[![Institution](https://img.shields.io/badge/Institution-Indus%20University-navy)](/)
[![Storage](https://img.shields.io/badge/Storage-localStorage-orange)](/)

---

## 🧭 About Inside Indus
**Inside Indus** is a lightweight, responsive web application designed for students, faculty, and visitors at **Indus University** to find and discover classrooms, laboratories, faculty members, and campus amenities with confidence.

### Core Concept:
> **Built by students for students**

Built cleanly with vanilla web technologies (HTML, CSS, JavaScript, localStorage), without external frameworks, backends, or authentication services. Simply open **`index.html`** in any web browser to run the entire application!

---

## 📂 Project Architecture

```text
ICT PROJECT/
├── index.html     # Main Single-Page Application (student portal)
├── admin.html     # Dedicated Admin Portal with email verification
├── style.css      # Warm pastel design system, Light & Dark themes, responsive layout
├── data.js        # Verified Indus University dataset & localStorage separated key management
├── script.js      # SPA navigation, search engine, 2D campus map, free rooms, and appointment booking
├── assets/        # Visual assets and photography (campus hero images and icons)
│   ├── images/    # High-resolution campus photography
│   └── icons/     # SVG icons
└── README.md      # Comprehensive guide and documentation
```

---

## 🚀 Key Features

### 1. 🔍 Instant Keyword Search
- Search classrooms, lecture halls, labs, faculty members, and campus amenities.
- Real-time ranking prioritizing exact name matches, room numbers, and keyword relevance.
- Example searches:
  - `LH-4` &rarr; Lecture Hall, Main Building (MB), Ground Floor, AC
  - `LH-14` &rarr; Lecture Hall, Bhanwan Building (BB), 1st Floor, AC
  - `Ms. Palak Shah` &rarr; Faculty, Bhanwan Building, 2nd Floor, Office B201 (Non-AC)
  - `Library` &rarr; Central Library, Main Building, 2nd Floor
  - `Tree Sitting` &rarr; Central Campus Landmark (Near Canteen)
- Persistent **Recent Searches** saved in browser `localStorage`.

### 2. 🏫 Confirmed Academic Data (No Invented Info)
- **Main Building (MB)**:
  - **Basement**: Campus Auditorium
  - **Ground Floor**: `LH-4` (Lecture Hall • AC)
  - **2nd Floor**: Central Library
  - **Administration**: Administration Office (Floor: *Information coming soon*)
- **Bhanwan Building (BB)**:
  - **1st Floor**: `LH-14` (AC), `LH-102` (Non-AC), `LH-101` (Non-AC), `LH-12` (AC), `LAB-128` (Lab • AC)
  - **2nd Floor**: `LAB-B227` (Lab • AC), `B201` (Ms. Palak Shah office • Non-AC)
  - **3rd Floor**: `LH-27` (Lecture Hall • AC)
  - **4th Floor**: `LAB-4` (Lab • AC)
  - **5th Floor**: `LH-B526` (Lecture Hall • Non-AC)
- **Facilities & Food**:
  - Student Canteen (Near Tree Sitting)
  - Searchable Food Outlets: *Cafeteria Indus University, K K Coffee Bar, The Dream Cafe, Nescafe, Tea Post*

### 3. 🟢 Live Free Classrooms System
- View available lecture halls for self-study and collaborative team projects.
- **Rule**: Classrooms are only marked as free once an availability slot is submitted by a student.
- Students can submit availability with Building &rarr; Floor &rarr; Classroom selector, date picker, and start/end time validation.
- Submitting a free classroom awards **+5 Karma Points ⭐**.
- **Report Occupied**: Students can report any room previously marked free that is currently occupied.

### 4. 🗺️ Confirmed Indus University Campus Grounds Map
- Vector 2D campus diagram representing confirmed campus topological relationships:
  - `Main Gate → Faculty Car Parking → Main Campus Road → Badminton Court → pathways → Main Building (MB)`
  - `Faculty Car Parking → Box Cricket → pathways → Tree Sitting`
  - `Volleyball Ground → pathways → Tree Sitting`
  - `Tree Sitting → pathways → Canteen`
  - `Tree Sitting → pathways → Bhanwan Building (BB)`
- Interactive landmarks and buildings (`MB`, `BB`, `TS`, `C`).

### 5. 📅 Faculty Appointment Booking
- Select any faculty member and request an appointment with student name, email, date, time, and message.
- Saved locally in `localStorage` under `inside_indus_appointments`.

### 6. 🔒 Dedicated Admin Portal (`admin.html`)
- Clean Admin Portal accessible via the footer link.
- Authorized email verification:
  - Validates authorized administrator email.
  - Rejects unauthorized users with *"Access denied. You are not an authorized administrator."*
- Full CRUD management across four core sections:
  1. **Classrooms**: Add, Edit, Delete (Name, Building, Floor, Type, AC/Non-AC)
  2. **Labs**: Add, Edit, Delete (Name, Building, Floor, AC/Non-AC)
  3. **Faculty**: Add, Edit, Delete (Name, Building, Floor, Room, AC/Non-AC, Contact info)
  4. **Facilities**: Add, Edit, Delete (Name, Location, Category, Description)
- Dedicated localStorage separated keys:
  - `inside_indus_classrooms`
  - `inside_indus_labs`
  - `inside_indus_faculty`
  - `inside_indus_facilities`
  - `inside_indus_admin_auth`
  - `inside_indus_free_rooms`
  - `inside_indus_appointments`
  - `inside_indus_karma`
  - `inside_indus_theme`

---

## 🏃 How to Run the Website

1. Navigate to the project folder:
   ```text
   C:\Users\Dell\Downloads\ICT PROJECT
   ```
2. Double-click **`index.html`** or right-click &rarr; **Open with** &rarr; Chrome, Edge, or Firefox.
3. Access the Admin Portal by clicking **🔒 Admin Portal** in the footer or opening **`admin.html`**.
4. Everything runs offline with zero setup!
