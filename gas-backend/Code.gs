function doOptions(e) {
  return handleResponse({});
}

function handleResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------
// 1. ดึงข้อมูลจากชีตส่งให้เว็บ (React)
// ----------------------------------------------------
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets(); 
    var allData = [];
    
    // วนลูปอ่านข้อมูลจากทุกชีตมารวมกัน
    sheets.forEach(function(sheet) {
      var data = sheet.getDataRange().getDisplayValues();
      if (data.length > 1) {
        var rows = data.slice(1); // ตัดหัวตาราง (แถวที่ 1) ทิ้ง
        allData = allData.concat(rows); 
      }
    });
    
    return handleResponse(allData);
  } catch(err) {
    return handleResponse({error: err.message});
  }
}

// ----------------------------------------------------
// 2. รับคำสั่ง Create / Delete จากเว็บ
// ----------------------------------------------------
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    
    if (action === 'create') {
      var email = payload.data.email;
      var title = payload.data.title;
      var start = new Date(payload.data.start);
      var end = new Date(payload.data.end);
      var location = payload.data.location || '';
      
      var cal = CalendarApp.getCalendarById(email);
      if (cal) {
        cal.createEvent(title, start, end, { location: location });
        // สั่งอัปเดตชีตทันทีเพื่อให้เว็บเห็นข้อมูลใหม่
        importCalendarsToSeparateSheets();
        return handleResponse({ success: true, message: "Event created" });
      } else {
        throw new Error("Calendar not found for: " + email);
      }
    }
    
    if (action === 'delete') {
      var email = payload.data.email;
      var title = payload.data.title;
      var start = new Date(payload.data.start);
      var end = new Date(payload.data.end);
      
      var cal = CalendarApp.getCalendarById(email);
      if (cal) {
        // ค้นหางานในช่วงเวลานั้น
        var events = cal.getEvents(start, end);
        for (var i = 0; i < events.length; i++) {
          if (events[i].getTitle() === title) {
            events[i].deleteEvent(); // สั่งลบออกจากปฏิทินจริง
            break; 
          }
        }
        // สั่งอัปเดตชีตทันที
        importCalendarsToSeparateSheets();
        return handleResponse({ success: true, message: "Event deleted" });
      } else {
        throw new Error("Calendar not found for: " + email);
      }
    }
    
    return handleResponse({ error: "Unknown action" });
    
  } catch(err) {
    return handleResponse({ error: err.message });
  }
}

// ----------------------------------------------------
// 3. ฟังก์ชันดึงข้อมูลจาก Calendar ลงชีต (ของคุณเดิม)
// ----------------------------------------------------
function importCalendarsToSeparateSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var employees = [
    { name: "Tanut", email: "tanut@nuclear-system.com" },
    { name: "Pongpon", email: "pongpon@nuclear-system.com" },
    { name: "Anan", email: "anan@nuclear-system.com" },
    { name: "Chainarong", email: "chainarong@nuclear-system.com" },
    { name: "Waramet", email: "dashboard@nuclear-system.com" }
  ];
  
  var today = new Date();
  var startTime = new Date(today.getTime() - (1 * 24 * 60 * 60 * 1000)); 
  var endTime = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); 
  
  employees.forEach(function(emp) {
    try {
      var sheet = ss.getSheetByName(emp.name);
      if (!sheet) {
        sheet = ss.insertSheet(emp.name);
      }
      
      sheet.clear(); 
      
      sheet.appendRow([
        "ชื่อพนักงาน/ปฏิทิน", 
        "ชื่องาน/กิจกรรม", 
        "เวลาเริ่ม", 
        "เวลาสิ้นสุด", 
        "รายละเอียด", 
        "Day Name", 
        "Day Index"
      ]);
      
      var cal = CalendarApp.getCalendarById(emp.email);
      if (cal) {
        var events = cal.getEvents(startTime, endTime);
        
        events.forEach(function(event) {
          var startDateTime = event.getStartTime();
          var dayName = Utilities.formatDate(startDateTime, Session.getScriptTimeZone(), "EEE");
          var jsDay = startDateTime.getDay(); 
          var dayIndex = (jsDay === 0) ? 7 : jsDay; 
          
          sheet.appendRow([
            emp.name,               
            event.getTitle(),       
            startDateTime,          
            event.getEndTime(),     
            event.getDescription(), 
            dayName,                
            dayIndex                
          ]);
        });
      }
    } catch(e) {
      Logger.log("ไม่สามารถดึงข้อมูลของ: " + emp.name + " (" + emp.email + ")");
    }
  });
}
