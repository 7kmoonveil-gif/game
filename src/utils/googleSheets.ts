import { LeaderboardEntry, CharacterRace } from '../types';

export const SHEET_ID = '1hObSf6dCZD4be8Dblrggt9LJprnGfx35LAsU0hgoZig';
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzhNx10lctSOSOeEeFu2EMlYfr6dr9AOPP6NWxe8nyUg28urKBG9WMAbqfv62T9KIZYaQ/exec';

const LOCAL_STORAGE_KEY = 'super_emoji_platformer_leaderboard';

// Default initial high scores if no network
const DEFAULT_SCORES: LeaderboardEntry[] = [
  { playerName: 'SkyWalker ⚡', race: 'human', score: 38, timeSeconds: 65, formattedTime: '01:05', status: 'WON', timestamp: '2026-08-22' },
  { playerName: 'ElfQueen 🌿', race: 'elf', score: 32, timeSeconds: 58, formattedTime: '00:58', status: 'WON', timestamp: '2026-08-22' },
  { playerName: 'MechaTitan 🤖', race: 'robot', score: 25, timeSeconds: 84, formattedTime: '01:24', status: 'WON', timestamp: '2026-08-22' },
  { playerName: 'OgreSmash 👹', race: 'ogre', score: 18, timeSeconds: 95, formattedTime: '01:35', status: 'WON', timestamp: '2026-08-22' },
];

/**
 * Sort entries:
 * 1. Score (Coins) descending (highest first)
 * 2. Time seconds ascending (lowest time first if score is equal)
 */
export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.timeSeconds - b.timeSeconds;
  });
}

/**
 * Get cached local leaderboard
 */
export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sortLeaderboard(parsed);
      }
    }
  } catch (err) {
    console.warn('Failed to parse local leaderboard', err);
  }
  return DEFAULT_SCORES;
}

/**
 * Save entry to local storage with upsert logic
 */
export function saveLocalEntry(newEntry: LeaderboardEntry): LeaderboardEntry[] {
  const current = getLocalLeaderboard();
  const existingIdx = current.findIndex(
    (e) => e.playerName.trim().toLowerCase() === newEntry.playerName.trim().toLowerCase()
  );

  if (existingIdx >= 0) {
    const existing = current[existingIdx];
    // Check if new score is better (higher score or equal score with faster time)
    const isBetter =
      newEntry.score > existing.score ||
      (newEntry.score === existing.score && newEntry.timeSeconds < existing.timeSeconds);

    if (isBetter) {
      current[existingIdx] = newEntry;
    }
  } else {
    current.push(newEntry);
  }

  const sorted = sortLeaderboard(current);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.warn('Failed to save to local storage', err);
  }
  return sorted;
}

/**
 * Fetch leaderboard from Google Apps Script
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const url = `${APPS_SCRIPT_URL}?action=getLeaderboard&sheetId=${SHEET_ID}&t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && Array.isArray(data.leaderboard)) {
        const mapped: LeaderboardEntry[] = data.leaderboard.map((item: {
          playerName?: string;
          name?: string;
          race?: CharacterRace;
          score?: number;
          timeSeconds?: number;
          formattedTime?: string;
          status?: 'WON' | 'LOST';
          timestamp?: string;
        }) => ({
          playerName: item.playerName || item.name || 'Anonymous',
          race: (item.race || 'human') as CharacterRace,
          score: Number(item.score) || 0,
          timeSeconds: Number(item.timeSeconds) || 0,
          formattedTime: item.formattedTime || formatSeconds(Number(item.timeSeconds) || 0),
          status: item.status === 'LOST' ? 'LOST' : 'WON',
          timestamp: item.timestamp || new Date().toLocaleDateString('th-TH'),
        }));

        const sorted = sortLeaderboard(mapped);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
        return sorted;
      }
    }
  } catch (err) {
    console.warn('Google Sheets fetch failed, using local storage backup', err);
  }
  return getLocalLeaderboard();
}

/**
 * Submit score to Google Apps Script & update LocalStorage
 */
export async function submitScore(entry: LeaderboardEntry): Promise<{ success: boolean; leaderboard: LeaderboardEntry[] }> {
  // Always update local storage first
  const updatedLocal = saveLocalEntry(entry);

  try {
    const payload = {
      action: 'saveScore',
      sheetId: SHEET_ID,
      playerName: entry.playerName,
      race: entry.race,
      score: entry.score,
      timeSeconds: entry.timeSeconds,
      formattedTime: entry.formattedTime,
      status: entry.status,
      timestamp: new Date().toISOString(),
    };

    // Use form-urlencoded or JSON with mode 'no-cors' fallback for Google Apps Script
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    }).catch((e) => console.warn('Background sync error:', e));

    return { success: true, leaderboard: updatedLocal };
  } catch (err) {
    console.warn('Error sending score to Google Sheets', err);
    return { success: false, leaderboard: updatedLocal };
  }
}

export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Full Google Apps Script Code template for user
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script for Super Emoji Platformer B2 Leaderboard
 * Sheet ID: 1hObSf6dCZD4be8Dblrggt9LJprnGfx35LAsU0hgoZig
 * รองรับการบันทึกและดึงข้อมูล พร้อมสร้าง Sheet ให้อัตโนมัติหากยังไม่มี
 */

const DEFAULT_SHEET_ID = "${SHEET_ID}";
const SHEET_NAME = "Leaderboard";

function doGet(e) {
  try {
    const sheetId = (e && e.parameter && e.parameter.sheetId) || DEFAULT_SHEET_ID;
    const action = (e && e.parameter && e.parameter.action) || "getLeaderboard";
    
    if (action === "getLeaderboard") {
      const data = getLeaderboardData(sheetId);
      return createJsonResponse({ success: true, leaderboard: data });
    }
    
    // Default HTML view if opened directly in browser
    return HtmlService.createHtmlOutput(
      "<!DOCTYPE html>" +
      "<html><head><meta charset='utf-8'><title>Super Emoji Platformer Leaderboard</title>" +
      "<style>body{font-family:'Prompt',sans-serif;padding:30px;background:#fef3c7;text-align:center;}" +
      "h1{color:#ea580c;}table{margin:20px auto;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);}" +
      "th,td{padding:12px 20px;border-bottom:1px solid #fed7aa;}th{background:#f97316;color:white;}</style></head>" +
      "<body><h1>🎮 Super Emoji Platformer Leaderboard API</h1><p>API Endpoint พร้อมใช้งานสำหรับ Sheet ID: " + sheetId + "</p>" +
      "<h3>ตารางผู้นำล่าสุด</h3>" + renderHtmlTable(sheetId) + "</body></html>"
    );
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

function doPost(e) {
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        body = e.parameter || {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    const sheetId = body.sheetId || DEFAULT_SHEET_ID;
    const playerName = (body.playerName || "Player").trim();
    const race = body.race || "human";
    const score = Number(body.score) || 0;
    const timeSeconds = Number(body.timeSeconds) || 0;
    const formattedTime = body.formattedTime || "00:00";
    const status = body.status || "WON";
    const timestamp = body.timestamp || new Date().toLocaleString("th-TH");

    const sheet = getOrCreateSheet(sheetId);
    const data = sheet.getDataRange().getValues();
    
    let updated = false;
    // Check if player name exists (skip header at row 0)
    for (let i = 1; i < data.length; i++) {
      const existingName = String(data[i][1]).trim();
      if (existingName.toLowerCase() === playerName.toLowerCase()) {
        const oldScore = Number(data[i][3]) || 0;
        const oldTime = Number(data[i][4]) || 999999;
        
        // Upsert if new score is better
        const isBetter = score > oldScore || (score === oldScore && timeSeconds < oldTime);
        if (isBetter) {
          sheet.getRange(i + 1, 1, 1, 7).setValues([[
            timestamp, playerName, race, score, timeSeconds, formattedTime, status
          ]]);
          updated = true;
        }
        break;
      }
    }

    if (!updated) {
      sheet.appendRow([timestamp, playerName, race, score, timeSeconds, formattedTime, status]);
    }

    return createJsonResponse({ success: true, message: "Score saved successfully!" });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

function getOrCreateSheet(sheetId) {
  let ss;
  if (sheetId && sheetId !== "YOUR_SHEET_ID") {
    try {
      ss = SpreadsheetApp.openById(sheetId);
    } catch (e) {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Setup Header Row with formatting
    sheet.getRange(1, 1, 1, 7).setValues([[
      "Timestamp", "PlayerName", "Race", "Score", "TimeSeconds", "FormattedTime", "Status"
    ]]);
    const headerRange = sheet.getRange(1, 1, 1, 7);
    headerRange.setBackground("#ea580c");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getLeaderboardData(sheetId) {
  const sheet = getOrCreateSheet(sheetId);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const list = [];
  for (let i = 1; i < data.length; i++) {
    list.push({
      timestamp: data[i][0],
      playerName: String(data[i][1]),
      race: String(data[i][2]),
      score: Number(data[i][3]) || 0,
      timeSeconds: Number(data[i][4]) || 0,
      formattedTime: String(data[i][5]),
      status: String(data[i][6])
    });
  }

  // Sort by Score descending, then TimeSeconds ascending
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSeconds - b.timeSeconds;
  });

  return list;
}

function renderHtmlTable(sheetId) {
  const list = getLeaderboardData(sheetId);
  if (list.length === 0) return "<p>ยังไม่มีข้อมูลผู้เล่น</p>";
  let html = "<table><tr><th>อันดับ</th><th>ผู้เล่น</th><th>เผ่า</th><th>เหรียญ 🪙</th><th>เวลา ⏱️</th><th>สถานะ</th></tr>";
  list.slice(0, 10).forEach((item, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : (index + 1);
    html += "<tr><td>" + medal + "</td><td><strong>" + item.playerName + "</strong></td><td>" + item.race + "</td><td>" + item.score + "</td><td>" + item.formattedTime + "</td><td>" + item.status + "</td></tr>";
  });
  html += "</table>";
  return html;
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
