# Bus Management System - Driver Time Tracking

A comprehensive web-based driver time tracking and management system designed for bus operators. This application streamlines employee management, overtime calculation, distance tracking, and day-off scheduling for efficient fleet operations.

## Features

### 🚌 Driver Time Tracking
- **Overtime Tracking**: Accurately record and calculate driver overtime hours
- **Distance Management**: Track total distance traveled with section-based breakdown
  - Section 1: 0-50 km
  - Section 2: 50-75 km
  - Section 3: 75+ km
- **Dynamic Rate Calculation**: Automatic overtime rate computation (₹/hour)
- **Real-time Calculations**: Instant updates to totals and summaries

### 👥 Employee Management
- **Add/Edit Employees**: Create and manage driver profiles
- **Token Numbers**: Unique identification for each driver
- **Hourly Rate Configuration**: Set custom hourly rates per employee
- **Employee Directory**: Quick access to all employee information

### 📊 Data Management
- **Local Storage**: Persistent data storage using browser localStorage
- **Search Functionality**: Find drivers by number(s) with multi-search support
- **Print Capability**: Print driver records and reports directly to PDF
- **Responsive Tables**: Clean, organized data presentation with totals

### 📅 Day-Off Management
- **Day-Off Tracking**: Mark and manage driver off days
- **Notification System**: Automatic notifications for scheduled off days
- **Smart Scheduling**: Prevents data entry for drivers on their off days

## Project Structure

```
BusManagement-main/
├── index.html          # Main driver tracking dashboard
├── employees.html      # Employee management interface
├── script.js          # Main application logic
├── employees.js       # Employee management functionality
├── styles.css         # Application styling
└── README.md          # Project documentation
```

## Installation & Usage

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BusManagement-main.git
   cd BusManagement-main
   ```

2. **Open in Browser**
   - Open `index.html` in your web browser to access the driver tracking system
   - Open `employees.html` to manage employee information

### No Installation Required
This is a client-side web application with no server or database dependencies. Simply open the HTML files in any modern web browser.

## How to Use

### Managing Employees
1. Navigate to `employees.html`
2. Fill in the employee details:
   - **Employee Name**: Full name of the driver
   - **Token Number**: Unique identifier
   - **Hourly Rate**: Overtime rate in rupees (₹)
3. Click "Save Employee" to add to the system
4. Manage existing employees from the employee list

### Tracking Driver Time
1. Open `index.html`
2. Search for a driver by their number
3. Enter tracking details:
   - Date of operation
   - Overtime hours and minutes
   - Total distance traveled
   - Mark day-off status if applicable
4. Click "Add Entry" to record the data
5. View real-time calculations in the table
6. Use "Print Page" to generate reports

## Browser Compatibility

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Any modern browser with ES6+ support

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: Browser localStorage API
- **UI Framework**: Custom CSS styling
- **No External Dependencies**: Pure HTML, CSS, and JavaScript

## Data Storage

All data is stored locally in your browser using `localStorage`. This means:
- ✅ Data persists between sessions
- ✅ No internet connection required
- ✅ Complete privacy - data stays on your device
- ⚠️ Data is device-specific (clearing browser cache will delete entries)

## Features in Development

- Enhanced day-off notification system with 7-day advance warnings
- Editable action table for dynamic day-off management
- Advanced reporting and analytics
- Multi-user support with role-based access

## License

This project is open source and available under the MIT License.

## Support

For issues, feature requests, or contributions, please open an issue or submit a pull request on GitHub.

## Author

Created for efficient bus fleet management and driver scheduling.

---

**Last Updated**: February 2026
