// Store all entries
let entries = [];

// Store all employees
let employees = [];

// DOM Elements
const entryForm = document.getElementById('entryForm');
const tableBody = document.getElementById('tableBody');
const totalTimeElement = document.getElementById('totalTime');
const totalAmountElement = document.getElementById('totalAmount');
const driverSummaryElement = document.getElementById('driverSummary');
const searchNumberInput = document.getElementById('searchNumber');
const dayOffInput = document.getElementById('dayOff');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const distanceInput = document.getElementById('entryTotalDistance');

// Load saved entries from localStorage
const savedEntries = localStorage.getItem('entries');
if (savedEntries) {
    entries = JSON.parse(savedEntries);
    updateTable();
    updateDriverSummary();
}

// Load saved employees from localStorage
const savedEmployees = localStorage.getItem('employees');
if (savedEmployees) {
    employees = JSON.parse(savedEmployees);
}

// Helper: Get employee by token
function getEmployeeByToken(token) {
    return employees.find(emp => emp.token === token);
}

// Helper: Formatters
function formatTime(hours, minutes) {
    return `${hours}h ${minutes}m`;
}
function formatAmount(amount) {
    return `₹${amount.toFixed(2)}`;
}
function formatDistance(distance) {
    return `${distance.toFixed(2)} km`;
}
function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Table Row Generator
function createTableRow(entry, index) {
    const employee = getEmployeeByToken(entry.token);
    if (!employee) return '';
    if (entry.isDayOff) {
        return `
            <tr>
                <td>${entry.token}</td>
                <td>${employee.name}</td>
                <td>${formatDate(entry.date)}</td>
                <td colspan="7" style="text-align:center; color:#e67e22; font-weight:bold;">Day Off</td>
                <td>
                    <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
                    <button class="edit-btn" onclick="editEntry(${index})">Edit</button>
                </td>
            </tr>
        `;
    } else {
        return `
            <tr>
                <td>${entry.token}</td>
                <td>${employee.name}</td>
                <td>${formatDate(entry.date)}</td>
                <td>${formatTime(entry.hours, entry.minutes)}</td>
                <td>${formatAmount(employee.hourlyRate)}</td>
                <td>${formatDistance(entry.totalDistance)}</td>
                <td>${formatDistance(entry.section1)}</td>
                <td>${formatDistance(entry.section2)}</td>
                <td>${formatDistance(entry.section3)}</td>
                <td>
                    <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
                    <button class="edit-btn" onclick="editEntry(${index})">Edit</button>
                </td>
            </tr>
        `;
    }
}

// Update Table
function updateTable(entriesToShow = entries) {
    tableBody.innerHTML = entriesToShow.map(createTableRow).join('');
    // Calculate totals
    let totalHours = 0;
    let totalMinutes = 0;
    let totalAmount = 0;
    let totalDistance = 0;
    let totalSection1 = 0;
    let totalSection2 = 0;
    let totalSection3 = 0;

    entriesToShow.forEach(entry => {
        if (!entry.isDayOff) {
            totalHours += entry.hours;
            totalMinutes += entry.minutes;
            totalAmount += entry.amount;
            totalDistance += entry.totalDistance;
            totalSection1 += entry.section1;
            totalSection2 += entry.section2;
            totalSection3 += entry.section3;
        }
    });
    // Convert excess minutes to hours
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    totalTimeElement.textContent = formatTime(totalHours, totalMinutes);
    totalAmountElement.textContent = formatAmount(totalAmount);
    document.getElementById('totalDistance').textContent = formatDistance(totalDistance);
    document.getElementById('totalSection1').textContent = formatDistance(totalSection1);
    document.getElementById('totalSection2').textContent = formatDistance(totalSection2);
    document.getElementById('totalSection3').textContent = formatDistance(totalSection3);
}

// Edit Entry
function editEntry(index) {
    const entry = entries[index];
    document.getElementById('numbers').value = entry.token;
    document.getElementById('date').value = entry.date;
    if (entry.isDayOff) {
        dayOffInput.checked = true;
        hoursInput.value = '';
        minutesInput.value = '';
        distanceInput.value = '';
    } else {
        dayOffInput.checked = false;
        hoursInput.value = entry.hours;
        minutesInput.value = entry.minutes;
        distanceInput.value = entry.totalDistance;
    }
    // Trigger the Day Off checkbox change event to set field states
    const event = new Event('change');
    dayOffInput.dispatchEvent(event);
    // Remove the old entry
    entries.splice(index, 1);
    localStorage.setItem('entries', JSON.stringify(entries));
    updateTable();
    updateDriverSummary();
}

// ... existing code ...
entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const numbersInput = document.getElementById('numbers').value.trim();
    const numbers = numbersInput.split(',').map(n => n.trim()).filter(Boolean);
    
    if (numbers.length === 0 || numbers.length > 2) {
        alert('Please enter one or two numbers, separated by a comma.');
        return;
    }
    
    if (numbers.length === 2 && numbers[0] === numbers[1]) {
        alert('Please enter two different numbers.');
        return;
    }
    
    // Check that all tokens exist as employees
    for (const number of numbers) {
        if (!getEmployeeByToken(number)) {
            alert(`Token number ${number} does not match any employee. Please check and try again.`);
            return;
        }
    }
    
    const date = document.getElementById('date').value;
    const isDayOff = dayOffInput.checked;
    
    // Check for rolling 6-day work rule for all numbers
    if (!isDayOff) {
        for (const number of numbers) {
            if (isOffDayForPerson(number, date)) {
                alert(`Person with number ${number} is on leave due to their off day (7th day after last Day Off). Please mark as Day Off.`);
                return;
            }
        }
    }
    
    let hours = 0, minutes = 0, totalDistance = 0, section1 = 0, section2 = 0, section3 = 0, timeInHours = 0;
    if (!isDayOff) {
        hours = parseInt(hoursInput.value) || 0;
        minutes = parseInt(minutesInput.value) || 0;
        totalDistance = parseFloat(distanceInput.value) || 0;
        // Calculate distance sections
        const remainingDistance = Math.max(0, totalDistance - 150);
        section1 = Math.min(50, remainingDistance);
        section2 = Math.min(25, Math.max(0, remainingDistance - 50));
        section3 = Math.max(0, remainingDistance - 75);
        // Convert hours and minutes to decimal hours for calculation
        timeInHours = hours + (minutes / 60);
    }
    
    // Create entries (one for each number)
    numbers.forEach(number => {
        const employee = getEmployeeByToken(number);
        if (!employee) return; // skip if not found (should not happen due to earlier check)
        let entryAmount = 0;
        if (!isDayOff) {
            entryAmount = timeInHours * employee.hourlyRate;
        }
        entries.push({
            number,
            token: number,
            date,
            hours,
            minutes,
            timeInHours,
            amount: entryAmount,
            totalDistance,
            section1,
            section2,
            section3,
            isDayOff
        });
    });
    
    localStorage.setItem('entries', JSON.stringify(entries));
    updateTable();
    updateDriverSummary();
    entryForm.reset();
    // Reset disables
    hoursInput.disabled = false;
    minutesInput.disabled = false;
    distanceInput.disabled = false;
});
// ... existing code ...

function getDayOfWeek(dateStr) {
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return new Date(dateStr).getDay();
}

function getDateOnly(dateStr) {
    // Returns yyyy-mm-dd for comparison
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
}

function hasWorkedConsecutiveWeek(personNumber, newDate) {
    // Find all entries for this person, sorted by date
    const personEntries = entries.filter(e => e.number === personNumber && !e.isDayOff)
        .map(e => getDateOnly(e.date))
        .sort();
    if (personEntries.length === 0) return false;
    // Find the first workday in the week
    const firstDate = personEntries[0];
    const firstDayOfWeek = getDayOfWeek(firstDate);
    // Find all unique workdays
    const uniqueDays = Array.from(new Set(personEntries));
    // Check for 7 consecutive days
    let count = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
        const prev = new Date(uniqueDays[i - 1]);
        const curr = new Date(uniqueDays[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            count++;
        } else {
            count = 1;
        }
        if (count >= 7) break;
    }
    // If 7 consecutive, check if newDate is the off day (same weekday as firstDate, but after 7 days)
    if (count >= 7) {
        const offDay = new Date(firstDate);
        offDay.setDate(offDay.getDate() + 7);
        const offDayStr = getDateOnly(offDay);
        if (getDateOnly(newDate) === offDayStr) {
            return true;
        }
    }
    return false;
}

function getPersonEntriesSorted(number) {
    return entries
        .filter(e => e.number === number)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function isOffDayForPerson(number, date) {
    // Find all entries for this person, sorted by date
    const personEntries = getPersonEntriesSorted(number);
    if (personEntries.length === 0) return false;
    // Find the most recent Day Off entry before or on the given date
    let lastDayOffDate = null;
    for (let i = 0; i < personEntries.length; i++) {
        if (personEntries[i].isDayOff && new Date(personEntries[i].date) <= new Date(date)) {
            lastDayOffDate = new Date(personEntries[i].date);
        }
    }
    if (!lastDayOffDate) return false;
    // Count days since last Day Off
    const daysSince = Math.floor((new Date(date) - lastDayOffDate) / (1000 * 60 * 60 * 24));
    // If today is the 7th day after last Day Off, it's an off day
    return daysSince > 0 && daysSince % 7 === 0;
}

function updateDriverSummary() {
    const driverSummary = {};
    entries.forEach(entry => {
        if (!driverSummary[entry.token]) {
            driverSummary[entry.token] = {
                totalHours: 0,
                totalMinutes: 0,
                totalAmount: 0,
                totalDistance: 0,
                section1: 0,
                section2: 0,
                section3: 0,
                dayOffs: 0
            };
        }
        if (entry.isDayOff) {
            driverSummary[entry.token].dayOffs += 1;
        } else {
        driverSummary[entry.token].totalHours += entry.hours;
        driverSummary[entry.token].totalMinutes += entry.minutes;
        driverSummary[entry.token].totalAmount += entry.amount;
            driverSummary[entry.token].totalDistance += entry.totalDistance;
            driverSummary[entry.token].section1 += entry.section1;
            driverSummary[entry.token].section2 += entry.section2;
            driverSummary[entry.token].section3 += entry.section3;
        }
    });
    driverSummaryElement.innerHTML = '';
    Object.entries(driverSummary).forEach(([token, data]) => {
        const employee = getEmployeeByToken(token);
        if (employee) {
            const totalHours = data.totalHours + Math.floor(data.totalMinutes / 60);
            const totalMinutes = data.totalMinutes % 60;
            let summaryHtml = `<h3>${employee.name}</h3>` +
                `<p>Total Time: ${formatTime(totalHours, totalMinutes)}</p>` +
                `<p>Total Amount: ${formatAmount(data.totalAmount)}</p>` +
                `<p>Total Distance: ${formatDistance(data.totalDistance)}</p>` +
                `<p>Section 1 (50km): ${formatDistance(data.section1)}</p>` +
                `<p>Section 2 (25km): ${formatDistance(data.section2)}</p>` +
                `<p>Section 3 (Remaining): ${formatDistance(data.section3)}</p>`;
            if (data.dayOffs > 0) {
                summaryHtml += `<p style="color:#e67e22; font-weight:bold;">Days Off: ${data.dayOffs}</p>`;
            }
            const card = document.createElement('div');
            card.className = 'driver-card';
            card.innerHTML = summaryHtml;
            driverSummaryElement.appendChild(card);
        }
    });
}

function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries.splice(index, 1);
        localStorage.setItem('entries', JSON.stringify(entries));
        updateTable();
        updateDriverSummary();
    }
}

function searchByNumber() {
    const searchValue = searchNumberInput.value.trim();
    if (!searchValue) {
        updateTable();
        return;
    }
    // Split by comma or whitespace, remove empty, and trim
    const searchTokens = searchValue.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    const filteredEntries = entries.filter(entry => searchTokens.includes(entry.token));
    updateTable(filteredEntries);
}

function printDetails() {
    // Get the search value and filter entries as in searchByNumber
    const searchValue = searchNumberInput.value.trim();
    let filteredEntries = entries;
    if (searchValue) {
        const searchTokens = searchValue.split(/[,	\s]+/).map(s => s.trim()).filter(Boolean);
        filteredEntries = entries.filter(entry => searchTokens.includes(entry.token));
    }

    // Create a print area
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write('<html><head><title>Print Details</title>');
    // Add styles for print
    const style = document.createElement('style');
    style.textContent = `
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #eee; }
        h2, h3 { margin-top: 20px; }
        .driver-card { border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 15px; background: #f9f9f9; }
    `;
    printWindow.document.head.appendChild(style);
    printWindow.document.write('</head><body>');

    // Table
    printWindow.document.write('<h2>Filtered Entries</h2>');
    printWindow.document.write('<table><thead><tr>' +
        '<th>Token</th><th>Name</th><th>Date</th><th>Overtime Hours</th><th>Overtime Rate 1hr(₹)</th>' +
        '<th>Total Distance (km)</th><th>Section 1 (50km)</th><th>Section 2 (25km)</th><th>Section 3 (Remaining)</th>' +
        '</tr></thead><tbody>');
    filteredEntries.forEach(entry => {
        printWindow.document.write('<tr>' +
            `<td>${entry.token}</td>` +
            `<td>${getEmployeeByToken(entry.token).name}</td>` +
            `<td>${formatDate(entry.date)}</td>` +
            `<td>${formatTime(entry.hours, entry.minutes)}</td>` +
            `<td>${formatAmount(getEmployeeByToken(entry.token).hourlyRate)}</td>` +
            `<td>${formatDistance(entry.totalDistance)}</td>` +
            `<td>${formatDistance(entry.section1)}</td>` +
            `<td>${formatDistance(entry.section2)}</td>` +
            `<td>${formatDistance(entry.section3)}</td>` +
            '</tr>');
    });
    printWindow.document.write('</tbody></table>');

    // Driver summary
    printWindow.document.write('<h2>Driver Summary</h2>');
    const driverSummary = {};
    filteredEntries.forEach(entry => {
        if (!driverSummary[entry.token]) {
            driverSummary[entry.token] = {
                totalHours: 0,
                totalMinutes: 0,
                totalAmount: 0,
                totalDistance: 0,
                section1: 0,
                section2: 0,
                section3: 0
            };
        }
        driverSummary[entry.token].totalHours += entry.hours;
        driverSummary[entry.token].totalMinutes += entry.minutes;
        driverSummary[entry.token].totalAmount += entry.amount;
        driverSummary[entry.token].totalDistance += entry.totalDistance;
        driverSummary[entry.token].section1 += entry.section1;
        driverSummary[entry.token].section2 += entry.section2;
        driverSummary[entry.token].section3 += entry.section3;
    });
    Object.entries(driverSummary).forEach(([token, data]) => {
        const employee = getEmployeeByToken(token);
        if (employee) {
            const totalHours = data.totalHours + Math.floor(data.totalMinutes / 60);
            const totalMinutes = data.totalMinutes % 60;
            printWindow.document.write('<div class="driver-card">' +
                `<h3>${employee.name}</h3>` +
                `<p>Total Time: ${formatTime(totalHours, totalMinutes)}</p>` +
                `<p>Total Amount: ${formatAmount(data.totalAmount)}</p>` +
                `<p>Total Distance: ${formatDistance(data.totalDistance)}</p>` +
                `<p>Section 1 (50km): ${formatDistance(data.section1)}</p>` +
                `<p>Section 2 (25km): ${formatDistance(data.section2)}</p>` +
                `<p>Section 3 (Remaining): ${formatDistance(data.section3)}</p>` +
                '</div>');
        }
    });

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// Add event listener for Day Off checkbox to enable/disable fields
if (dayOffInput) {
    dayOffInput.addEventListener('change', function() {
        if (this.checked) {
            hoursInput.disabled = true;
            minutesInput.disabled = true;
            distanceInput.disabled = true;
            hoursInput.value = '';
            minutesInput.value = '';
            distanceInput.value = '';
        } else {
            hoursInput.disabled = false;
            minutesInput.disabled = false;
            distanceInput.disabled = false;
        }
    });
} 