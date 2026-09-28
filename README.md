# 💰 Expense Tracker

A simple, user-friendly web application to record, manage, monitor, and filter your income and expenses — all in your browser.

---

## 📋 Project Purpose

This Expense Tracker helps individuals maintain basic financial records by tracking income and expense transactions, calculating balances automatically, and providing visual summaries of spending habits.

---

## ✨ Features

### Core Features
- **Add Transaction** — Record income or expense with amount, category, date, and description
- **Edit Transaction** — Modify any existing transaction; totals update automatically
- **Delete Transaction** — Remove transactions with a confirmation dialog
- **Financial Summary** — Real-time display of Total Income, Total Expenses, and Current Balance
- **Filter by Type** — View All, Income only, or Expense only
- **Filter by Category** — View transactions for a specific category
- **Input Validation** — Clear error messages for empty/invalid inputs
- **Data Persistence** — All data saved to Browser Local Storage (survives page refresh)
- **Responsive Design** — Works on Desktop, Laptop, Tablet, and Mobile screens

### Bonus Features
- **Monthly Expense Summary** — Select a month to view total expenses for that period
- **Category-wise Expense Chart** — Visual bar chart showing expense distribution across categories

---

## 🛠️ Technologies Used

| Component         | Technology            |
| ----------------- | --------------------- |
| Structure         | HTML5                 |
| Styling           | CSS3 (Vanilla)        |
| Application Logic | JavaScript (ES6+)     |
| Data Storage      | Browser Local Storage |
| Typography        | Google Fonts (Inter)  |

No backend, frameworks, or external databases required.

---

## 🚀 How to Run

1. **Clone or download** this repository
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari)
3. That's it! The application runs entirely in the browser

```bash
# Clone the repository
git clone https://github.com/your-username/expense-tracker-candidate-name.git

# Open in browser
cd expense-tracker-candidate-name
# Double-click index.html or open it in your browser
```

---

## 💾 Local Storage Usage

- All transaction data is stored in the browser's **Local Storage** under the key `expense_tracker_transactions`
- Data persists after page refresh, browser close, and reopen
- Adding, editing, or deleting a transaction immediately updates Local Storage
- No server or cloud database is needed

> **Note:** Clearing browser data or Local Storage will remove all saved transactions.

---

## 📁 Project Structure

```
expense-tracker-candidate-name/
├── index.html    — Application structure and layout
├── style.css     — Styling, responsive design, animations
├── script.js     — Application logic, CRUD, validation, charts
└── README.md     — Project documentation
```

---

## 🎁 Bonus Features Implemented

- ✅ **Monthly Expense Summary** — Pick any month to see aggregated expense totals
- ✅ **Category-wise Expense Chart** — Animated horizontal bar chart showing spending by category

---

## 📄 License

This project is for educational and assessment purposes.
