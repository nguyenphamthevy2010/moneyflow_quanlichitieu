// ============================================
// MONEYFLOW
// HTML + CSS + JAVASCRIPT
// ============================================


// ============================================
// DOM HELPER
// ============================================

const $ = (selector) =>
    document.querySelector(selector);


// ============================================
// CATEGORY ICONS
// ============================================

const categoryIcons = {

    "Ăn uống":
        "utensils",

    "Di chuyển":
        "car",

    "Mua sắm":
        "shopping-bag",

    "Giải trí":
        "gamepad-2",

    "Học tập":
        "book-open",

    "Khác":
        "package"

};


// ============================================
// DATA
// ============================================

let expenses =
    JSON.parse(
        localStorage.getItem(
            "moneyflow_expenses"
        )
    ) || [];


let budget =
    Number(
        localStorage.getItem(
            "moneyflow_budget"
        )
    ) || 10000000;


let selectedCategory =
    "Ăn uống";


// ============================================
// SAVE
// ============================================

function saveExpenses() {

    localStorage.setItem(
        "moneyflow_expenses",
        JSON.stringify(expenses)
    );

}


function saveBudget() {

    localStorage.setItem(
        "moneyflow_budget",
        budget
    );

}


// ============================================
// ICON REFRESH
// ============================================

function refreshIcons() {

    if (
        window.lucide &&
        typeof lucide.createIcons === "function"
    ) {

        lucide.createIcons();

    }

}


// ============================================
// MONEY FORMAT
// ============================================

function formatMoney(number) {

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(number) + " ₫";

}


// ============================================
// DATE
// ============================================

function getTodayString() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date.toLocaleDateString(
        "vi-VN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


function isToday(dateString) {

    return (
        dateString ===
        getTodayString()
    );

}


function isCurrentMonth(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    const now =
        new Date();

    return (
        date.getMonth() ===
            now.getMonth() &&

        date.getFullYear() ===
            now.getFullYear()
    );

}


// ============================================
// HEADER
// ============================================

function updateHeader() {

    const now =
        new Date();

    $("#todayText").textContent =
        now.toLocaleDateString(
            "vi-VN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


// ============================================
// DASHBOARD
// ============================================

function updateDashboard() {

    const monthExpenses =
        expenses.filter(
            item =>
                isCurrentMonth(
                    item.date
                )
        );


    const todayExpenses =
        expenses.filter(
            item =>
                isToday(
                    item.date
                )
        );


    const monthTotal =
        monthExpenses.reduce(
            (sum, item) =>
                sum +
                Number(item.amount),
            0
        );


    const todayTotal =
        todayExpenses.reduce(
            (sum, item) =>
                sum +
                Number(item.amount),
            0
        );


    const remaining =
        Math.max(
            budget - monthTotal,
            0
        );


    const percent =
        budget > 0
            ? Math.min(
                (monthTotal / budget) * 100,
                100
            )
            : 0;


    $("#monthExpense")
        .textContent =
        formatMoney(
            monthTotal
        );


    $("#todayExpense")
        .textContent =
        formatMoney(
            todayTotal
        );


    $("#remainingBudget")
        .textContent =
        formatMoney(
            remaining
        );


    $("#transactionCount")
        .textContent =
        monthExpenses.length;


    $("#budgetPercent")
        .textContent =
        `${percent.toFixed(0)}% ngân sách đã sử dụng`;


    $("#budgetDisplay")
        .textContent =
        formatMoney(
            budget
        );


    $("#budgetUsed")
        .textContent =
        `Đã dùng: ${formatMoney(monthTotal)}`;


    $("#budgetLeft")
        .textContent =
        `Còn lại: ${formatMoney(remaining)}`;


    $("#budgetProgress")
        .style.width =
        `${percent}%`;


    renderCategories();

    renderRecentTransactions();

    renderAllTransactions();

    renderChart();

}


// ============================================
// CATEGORY
// ============================================

function renderCategories() {

    const container =
        $("#categoryList");


    const monthExpenses =
        expenses.filter(
            item =>
                isCurrentMonth(
                    item.date
                )
        );


    const total =
        monthExpenses.reduce(
            (sum, item) =>
                sum +
                Number(item.amount),
            0
        );


    const categoryTotals = {};


    monthExpenses.forEach(
        item => {

            if (
                !categoryTotals[
                    item.category
                ]
            ) {

                categoryTotals[
                    item.category
                ] = 0;

            }

            categoryTotals[
                item.category
            ] += Number(
                item.amount
            );

        }
    );


    const categories =
        Object.entries(
            categoryTotals
        ).sort(
            (a, b) =>
                b[1] - a[1]
        );


    if (
        categories.length === 0
    ) {

        container.innerHTML = `
            <div style="
                color:var(--muted);
                font-size:13px;
                padding:10px 0;
            ">
                Chưa có chi tiêu trong tháng này.
            </div>
        `;

        return;

    }


    container.innerHTML =
        categories
            .map(
                ([category, amount]) => {

                    const percent =
                        total
                            ? (
                                amount /
                                total
                            ) * 100
                            : 0;


                    const icon =
                        categoryIcons[
                            category
                        ] || "package";


                    return `

                        <div class="category-item">

                            <div class="category-icon">
                                <i data-lucide="${icon}"></i>
                            </div>

                            <div>

                                <div class="category-name">
                                    ${category}
                                </div>

                                <div class="category-value">
                                    ${formatMoney(amount)}
                                </div>

                            </div>

                            <strong>
                                ${percent.toFixed(0)}%
                            </strong>

                            <div class="category-bar">
                                <div
                                    style="
                                        width:${percent}%
                                    "
                                ></div>
                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    refreshIcons();

}


// ============================================
// TRANSACTION HTML
// ============================================

function transactionHTML(item) {

    const icon =
        categoryIcons[
            item.category
        ] || "package";


    return `

        <div class="transaction">

            <div class="transaction-icon">
                <i data-lucide="${icon}"></i>
            </div>


            <div class="transaction-info">

                <strong>
                    ${escapeHTML(
                        item.note ||
                        item.category
                    )}
                </strong>

                <span>
                    ${item.category}
                    •
                    ${formatDate(item.date)}
                </span>

            </div>


            <div class="transaction-amount">
                -${formatMoney(
                    item.amount
                )}
            </div>


            <button
                class="delete-btn"
                onclick="deleteExpense('${item.id}')"
                title="Xóa giao dịch"
            >
                <i data-lucide="trash-2"></i>
            </button>

        </div>

    `;

}


// ============================================
// RECENT TRANSACTIONS
// ============================================

function renderRecentTransactions() {

    const container =
        $("#recentTransactions");


    const recent =
        [...expenses]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);


    if (
        recent.length === 0
    ) {

        container.innerHTML = `

            <div style="
                color:var(--muted);
                padding:10px 0;
                font-size:13px;
            ">

                Chưa có giao dịch nào.

            </div>

        `;

        return;

    }


    container.innerHTML =
        recent
            .map(
                transactionHTML
            )
            .join("");


    refreshIcons();

}


// ============================================
// ALL TRANSACTIONS
// ============================================

function renderAllTransactions() {

    const container =
        $("#allTransactions");


    const search =
        (
            $("#searchInput")?.value ||
            ""
        )
        .toLowerCase()
        .trim();


    const filtered =
        [...expenses]
            .filter(
                item => {

                    const text =
                        (
                            item.note +
                            " " +
                            item.category
                        ).toLowerCase();

                    return text.includes(
                        search
                    );

                }
            )
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );


    if (
        filtered.length === 0
    ) {

        container.innerHTML = `

            <div style="
                color:var(--muted);
                padding:25px 0;
                text-align:center;
                font-size:13px;
            ">

                Không tìm thấy giao dịch.

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered
            .map(
                transactionHTML
            )
            .join("");


    refreshIcons();

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ============================================
// ADD EXPENSE
// ============================================

$("#expenseForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const amount =
                Number(
                    $("#amount").value
                );


            const date =
                $("#expenseDate").value;


            const note =
                $("#note")
                    .value
                    .trim();


            if (
                !amount ||
                amount <= 0
            ) {

                showToast(
                    "Vui lòng nhập số tiền hợp lệ."
                );

                return;

            }


            if (!date) {

                showToast(
                    "Vui lòng chọn ngày."
                );

                return;

            }


            const expense = {

                id:
                    Date.now().toString(),

                amount:

                    amount,

                category:

                    selectedCategory,

                date:

                    date,

                note:

                    note ||
                    selectedCategory

            };


            expenses.push(
                expense
            );


            saveExpenses();


            closeModal();


            $("#expenseForm")
                .reset();


            $("#expenseDate")
                .value =
                getTodayString();


            selectedCategory =
                "Ăn uống";


            updateCategoryButtons();


            updateDashboard();


            showToast(
                "Đã thêm chi tiêu ✓"
            );

        }
    );


// ============================================
// DELETE
// ============================================

function deleteExpense(id) {

    const confirmed =
        confirm(
            "Bạn có chắc muốn xóa giao dịch này?"
        );


    if (!confirmed) {
        return;
    }


    expenses =
        expenses.filter(
            item =>
                item.id !== id
        );


    saveExpenses();


    updateDashboard();


    showToast(
        "Đã xóa giao dịch."
    );

}


// ============================================
// CATEGORY SELECT
// ============================================

document
    .querySelectorAll(
        "#categorySelect button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectedCategory =
                        button.dataset.category;


                    updateCategoryButtons();

                }
            );

        }
    );


function updateCategoryButtons() {

    document
        .querySelectorAll(
            "#categorySelect button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "selected",
                    button.dataset.category ===
                        selectedCategory
                );

            }
        );

}


// ============================================
// MODAL
// ============================================

function openModal() {

    $("#modal")
        .classList
        .add("show");


    $("#expenseDate")
        .value =
        getTodayString();


    refreshIcons();


    setTimeout(
        () => {

            $("#amount")
                .focus();

        },
        100
    );

}


function closeModal() {

    $("#modal")
        .classList
        .remove("show");

}


$("#openModal")
    .addEventListener(
        "click",
        openModal
    );


$("#mobileAdd")
    .addEventListener(
        "click",
        openModal
    );


$("#closeModal")
    .addEventListener(
        "click",
        closeModal
    );


$("#modal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("#modal")
            ) {

                closeModal();

            }

        }
    );


// ============================================
// ESC CLOSE MODAL
// ============================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


// ============================================
// NAVIGATION
// ============================================

document
    .querySelectorAll(
        "[data-section]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showSection(
                        button.dataset.section
                    );

                }
            );

        }
    );


function showSection(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(
            section => {

                section.classList.remove(
                    "active-section"
                );

            }
        );


    const section =
        document.getElementById(
            sectionId
        );


    if (section) {

        section.classList.add(
            "active-section"
        );

    }


    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.section ===
                        sectionId
                );

            }
        );


    const titles = {

        dashboard:
            "Tổng quan",

        transactions:
            "Giao dịch",

        budget:
            "Ngân sách",

        settings:
            "Cài đặt"

    };


    $("#pageTitle")
        .textContent =
        titles[sectionId] ||
        "MoneyFlow";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    refreshIcons();

}


// ============================================
// BUDGET
// ============================================

$("#changeBudget")
    .addEventListener(
        "click",
        () => {

            const value =
                prompt(
                    "Nhập ngân sách tháng (VNĐ):",
                    budget
                );


            if (
                value === null
            ) {

                return;

            }


            const newBudget =
                Number(value);


            if (
                !newBudget ||
                newBudget <= 0
            ) {

                showToast(
                    "Ngân sách không hợp lệ."
                );

                return;

            }


            budget =
                newBudget;


            saveBudget();


            updateDashboard();


            showToast(
                "Đã cập nhật ngân sách ✓"
            );

        }
    );


// ============================================
// SEARCH
// ============================================

$("#searchInput")
    .addEventListener(
        "input",
        renderAllTransactions
    );


// ============================================
// CHART
// ============================================

function renderChart() {

    const days =
        Number(
            $("#chartRange")
                .value
        );


    const bars =
        $("#chartBars");


    const labels =
        $("#chartLabels");


    const data = [];


    for (
        let i = days - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date();


        date.setDate(
            date.getDate() - i
        );


        const dateString =
            getLocalDateString(
                date
            );


        const total =
            expenses
                .filter(
                    item =>
                        item.date ===
                        dateString
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        Number(item.amount),
                    0
                );


        data.push({
            date,
            total
        });

    }


    const max =
        Math.max(
            ...data.map(
                item =>
                    item.total
            ),
            100000
        );


    bars.innerHTML =
        data
            .map(
                item => {

                    const height =
                        Math.max(
                            (
                                item.total /
                                max
                            ) * 100,

                            item.total > 0
                                ? 4
                                : 1
                        );


                    return `

                        <div
                            class="bar-wrap"
                            title="${formatMoney(
                                item.total
                            )}"
                        >

                            <div
                                class="bar"
                                style="
                                    height:${height}%
                                "
                            ></div>

                        </div>

                    `;

                }
            )
            .join("");


    labels.innerHTML =
        data
            .map(
                item => {

                    return `
                        <span>
                            ${item.date.getDate()}/
                            ${item.date.getMonth() + 1}
                        </span>
                    `;

                }
            )
            .join("");

}


function getLocalDateString(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


$("#chartRange")
    .addEventListener(
        "change",
        renderChart
    );


// ============================================
// DARK MODE
// ============================================

const darkMode =
    $("#darkMode");


const savedDarkMode =
    localStorage.getItem(
        "moneyflow_dark"
    ) === "true";


darkMode.checked =
    savedDarkMode;


if (
    savedDarkMode
) {

    document.body
        .classList
        .add("dark");

}


darkMode.addEventListener(
    "change",
    () => {

        document.body
            .classList
            .toggle(
                "dark",
                darkMode.checked
            );


        localStorage.setItem(
            "moneyflow_dark",
            darkMode.checked
        );

    }
);


// ============================================
// NOTIFICATION
// ============================================

const notificationToggle =
    $("#notificationToggle");


const notificationTime =
    $("#notificationTime");


notificationToggle.checked =
    localStorage.getItem(
        "moneyflow_notification"
    ) === "true";


notificationTime.value =
    localStorage.getItem(
        "moneyflow_notification_time"
    ) || "20:00";


// --------------------------------------------
// TOGGLE
// --------------------------------------------

notificationToggle
    .addEventListener(
        "change",
        async () => {

            if (
                notificationToggle.checked
            ) {

                const permission =
                    await requestNotificationPermission();


                if (
                    permission !==
                    "granted"
                ) {

                    notificationToggle.checked =
                        false;

                    return;

                }


                showToast(
                    "Đã bật nhắc nhở hằng ngày 🔔"
                );

            }


            localStorage.setItem(
                "moneyflow_notification",
                notificationToggle.checked
            );

        }
    );


// --------------------------------------------
// TIME
// --------------------------------------------

notificationTime
    .addEventListener(
        "change",
        () => {

            localStorage.setItem(
                "moneyflow_notification_time",
                notificationTime.value
            );


            showToast(
                `Giờ nhắc: ${notificationTime.value}`
            );

        }
    );


// --------------------------------------------
// HEADER NOTIFICATION
// --------------------------------------------

$("#notificationBtn")
    .addEventListener(
        "click",
        async () => {

            const permission =
                await requestNotificationPermission();


            if (
                permission ===
                "granted"
            ) {

                notificationToggle.checked =
                    true;


                localStorage.setItem(
                    "moneyflow_notification",
                    "true"
                );


                showToast(
                    "Notification đã được bật 🔔"
                );

            }

        }
    );


// --------------------------------------------
// PERMISSION
// --------------------------------------------

async function requestNotificationPermission() {

    if (
        !("Notification" in window)
    ) {

        showToast(
            "Trình duyệt không hỗ trợ notification."
        );

        return "denied";

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        return "granted";

    }


    return await Notification
        .requestPermission();

}


// ============================================
// DAILY REMINDER
// ============================================

function checkReminder() {

    const enabled =
        localStorage.getItem(
            "moneyflow_notification"
        ) === "true";


    if (!enabled) {
        return;
    }


    if (
        !("Notification" in window) ||
        Notification.permission !==
            "granted"
    ) {

        return;

    }


    const today =
        getTodayString();


    const hasExpenseToday =
        expenses.some(
            item =>
                item.date === today
        );


    if (
        hasExpenseToday
    ) {

        return;

    }


    const now =
        new Date();


    const currentTime =

        String(
            now.getHours()
        ).padStart(2, "0")

        +

        ":" +

        String(
            now.getMinutes()
        ).padStart(2, "0");


    const reminderTime =
        localStorage.getItem(
            "moneyflow_notification_time"
        ) || "20:00";


    const lastReminder =
        localStorage.getItem(
            "moneyflow_last_reminder"
        );


    if (
        currentTime >=
            reminderTime &&

        lastReminder !==
            today
    ) {

        new Notification(
            "MoneyFlow",
            {
                body:
                    "Bạn đã nhập chi tiêu hôm nay chưa?"
            }
        );


        localStorage.setItem(
            "moneyflow_last_reminder",
            today
        );

    }

}


// ============================================
// TOAST
// ============================================

let toastTimeout;


function showToast(message) {

    const toast =
        $("#toast");


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


// ============================================
// INITIALIZE
// ============================================

updateHeader();


$("#expenseDate")
    .value =
    getTodayString();


updateCategoryButtons();


updateDashboard();


refreshIcons();


checkReminder();


// Kiểm tra notification mỗi 30 giây
setInterval(
    checkReminder,
    30000
);