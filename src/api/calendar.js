import axios from 'axios';

// Google Apps Script Web App URL (Secured via .env)
const GAS_API_URL = import.meta.env.VITE_GAS_API_URL;

if (!GAS_API_URL) {
  console.warn("Missing VITE_GAS_API_URL in .env file!");
}

const EMPLOYEE_EMAILS = {
  "Tanut": "tanut@nuclear-system.com",
  "Pongpon": "pongpon@nuclear-system.com",
  "Anan": "anan@nuclear-system.com",
  "Chainarong": "chainarong@nuclear-system.com",
  "Waramet": "dashboard@nuclear-system.com"
};

let dataCache = null;
let fetchPromise = null;

// Fetch all sheet data once and cache it
const getAllData = async () => {
  if (dataCache) return dataCache;
  if (fetchPromise) return fetchPromise;
  
  fetchPromise = axios.get(GAS_API_URL).then(res => {
    dataCache = Array.isArray(res.data) ? res.data : [];
    return dataCache;
  }).catch(err => {
    console.error("GAS Fetch error", err);
    return [];
  });
  
  return fetchPromise;
};

const EMPLOYEE_DEPARTMENTS = {
  "Tanut": "Sale",
  "Pongpon": "Engineer",
  "Anan": "Engineer",
  "Chainarong": "Engineer",
  "Waramet": "Sale"
};

export const fetchEmployees = async () => {
  const data = await getAllData();
  const employeesMap = {};
  
  // Pre-fill with all known employees so cards always show up
  Object.keys(EMPLOYEE_EMAILS).forEach(name => {
    const realEmail = EMPLOYEE_EMAILS[name];
    employeesMap[realEmail] = {
      id: realEmail,
      name: name,
      email: realEmail,
      department: EMPLOYEE_DEPARTMENTS[name] || "General",
      avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=1f2937&color=00c8ff`
    };
  });
  
  data.forEach(row => {
    const rowName = row[0]; // Column A: ชื่อพนักงาน/ปฏิทิน
    if (rowName && typeof rowName === 'string') {
      const realEmail = EMPLOYEE_EMAILS[rowName] || rowName;
      if (!employeesMap[realEmail]) {
        employeesMap[realEmail] = {
          id: realEmail,
          name: rowName,
          email: realEmail,
          department: EMPLOYEE_DEPARTMENTS[rowName] || "General",
          avatarUrl: `https://ui-avatars.com/api/?name=${rowName}&background=1f2937&color=00c8ff`
        };
      }
    }
  });
  
  return Object.values(employeesMap);
};

// Helper to parse custom date formats from Google Apps Script sheets
const parseGASDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  const cleanStr = String(dateStr).trim();
  
  // Match "D/M/YYYY" or "D/M/YYYY, H:mm:ss" or "D/M/YYYY H:mm:ss"
  // E.g. "25/5/2026", "26/6/2026, 9:00:00", "27/5/2569" (BE year)
  const dmYRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*|\s+)?(\d{1,2})?:?(\d{2})?:?(\d{2})?$/;
  const match = cleanStr.match(dmYRegex);
  
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed month
    let year = parseInt(match[3], 10);
    
    // Convert Buddhist Era (BE) to Christian Era (CE) if needed
    if (year > 2400) {
      year -= 543;
    }
    
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const minute = match[5] ? parseInt(match[5], 10) : 0;
    const second = match[6] ? parseInt(match[6], 10) : 0;
    
    return new Date(year, month, day, hour, minute, second);
  }
  
  const parsed = new Date(cleanStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  return null;
};

export const fetchEvents = async (email, startDate, endDate) => {
  const data = await getAllData();
  const events = [];
  
  data.forEach((row, index) => {
    const rowName = row[0]; // Column A
    const rowEmail = EMPLOYEE_EMAILS[rowName] || rowName;
    
    if (rowEmail === email) {
      const parsedStart = parseGASDate(row[2]);
      const parsedEnd = parseGASDate(row[3]);
      
      events.push({
        id: `${email}-${index}`,
        email: email, // Store email for deletion
        rowIndex: index,
        title: row[1] || 'No Title', // Column B: ชื่องาน/กิจกรรม
        start: parsedStart ? parsedStart.toISOString() : row[2], // Column C: เวลาเริ่ม
        end: parsedEnd ? parsedEnd.toISOString() : row[3],   // Column D: เวลาสิ้นสุด
        location: row[4] || '' // Column E: รายละเอียด
      });
    }
  });
  
  return events;
};

export const createEvent = async (eventData) => {
  try {
    const res = await axios.post(GAS_API_URL, JSON.stringify({
      action: 'create',
      data: eventData
    }), {
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    
    if (res.data.error) {
      throw new Error(`GAS Error: ${res.data.error}`);
    }

    // Invalidate cache so next fetch gets fresh data
    dataCache = null;
    fetchPromise = null;
    return res.data;
  } catch (err) {
    console.error("Create event error", err);
    throw err;
  }
};

export const deleteEvent = async (event) => {
  try {
    const res = await axios.post(GAS_API_URL, JSON.stringify({
      action: 'delete',
      data: {
        email: event.email,
        title: event.title,
        start: event.start,
        end: event.end
      }
    }), {
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });

    if (res.data.error) {
      throw new Error(`GAS Error: ${res.data.error}`);
    }

    // Invalidate cache
    dataCache = null;
    fetchPromise = null;
    return res.data;
  } catch (err) {
    console.error("Delete event error", err);
    throw err;
  }
};
