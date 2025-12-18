// script.js
const notes = {};
let selectedDates = new Set();

function getWeeksOf2026() {
    const weeks = [];
    // Start from Jan 10, 2026
    const startDate = new Date(2026, 0, 10);
    // Find the previous Sunday (or the same day if Sunday)
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());

    // End at Jan 10, 2027
    const endDate = new Date(2027, 0, 10);
    let weekNum = 1;
    let weekStart = new Date(firstSunday);
    while (true) {
        const days = [];
        for (let j = 0; j < 7; j++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + j);
            days.push(day);
        }
        weeks.push({
            number: weekNum,
            days: days
        });
        weekNum++;
        weekStart.setDate(weekStart.getDate() + 7);
        // Stop if the last day of this week is after Jan 10, 2027
        if (days[6] >= endDate) {
            break;
        }
    }
    return weeks;
}

function formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function saveNote(weekNum, dayIndex, value) {
    notes[`${weekNum}-${dayIndex}`] = value;
}

function clearWeek(weekNum) {
    for (let i = 0; i < 7; i++) {
        const key = `${weekNum}-${i}`;
        delete notes[key];
        const textarea = document.querySelector(`textarea[data-key="${key}"]`);
        if (textarea) textarea.value = '';
    }
}


function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const weeks = getWeeksOf2026();
    const showDates = document.getElementById('showDates').checked;
    // Clear existing
    calendar.innerHTML = '';
    // Header row
    const headerLabels = ['Week', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    headerLabels.forEach(label => {
        const cell = document.createElement('div');
        cell.className = 'header-cell';
        cell.textContent = label;
        calendar.appendChild(cell);
    });
    // Week rows
    weeks.forEach(week => {
        // Week label
        const weekLabel = document.createElement('div');
        weekLabel.className = 'week-label';
        weekLabel.innerHTML = `
            W${week.number}
            <button class="clear-btn" onclick="clearWeek(${week.number})">Clear</button>
        `;
        calendar.appendChild(weekLabel);
        // Days
        week.days.forEach((date, dayIndex) => {
            const noteKey = `${week.number}-${dayIndex}`;
            // Grey out days before Jan 10, 2026
            const isBeforeStart = date < new Date(2026, 0, 10);
            // Cutesy color for all days in range
            const isInRange = date >= new Date(2026, 0, 10) && date <= new Date(2027, 0, 10);
            let dayCell = document.createElement('div');
            if (isBeforeStart) {
                dayCell.className = 'day-cell not-current-year';
            } else if (isInRange) {
                dayCell.className = `day-cell month-${date.getMonth()}`;
            } else {
                dayCell.className = 'day-cell not-current-year';
            }
            dayCell.dataset.key = noteKey;
            // Highlight if selected
            if (selectedDates.has(noteKey)) {
                dayCell.classList.add('selected');
            }
            // Selection logic
            dayCell.addEventListener('click', function(e) {
                // Only select if not clicking textarea
                if (e.target.tagName.toLowerCase() === 'textarea') return;
                if (selectedDates.has(noteKey)) {
                    selectedDates.delete(noteKey);
                    dayCell.classList.remove('selected');
                } else {
                    selectedDates.add(noteKey);
                    dayCell.classList.add('selected');
                }
                updateMultiEventButton();
            });
            if (showDates) {
                const dateLabel = document.createElement('div');
                dateLabel.className = 'date-label';
                dateLabel.textContent = formatDate(date);
                dayCell.appendChild(dateLabel);
            }
            const textarea = document.createElement('textarea');
            textarea.setAttribute('data-key', noteKey);
            textarea.value = notes[noteKey] || '';
            textarea.placeholder = '...';
            textarea.addEventListener('input', (e) => {
                saveNote(week.number, dayIndex, e.target.value);
            });
            dayCell.appendChild(textarea);
            calendar.appendChild(dayCell);
        });
    });
    updateMultiEventButton();
}

function updateMultiEventButton() {
    let btn = document.getElementById('multi-event-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'multi-event-btn';
        btn.textContent = 'Add event to selected days';
        btn.style.margin = '10px 0 20px 0';
        btn.style.display = 'none';
        btn.onclick = handleMultiEvent;
        document.querySelector('.planner').insertBefore(btn, document.getElementById('calendar'));
    }
    btn.style.display = selectedDates.size > 0 ? 'block' : 'none';
}

function handleMultiEvent() {
    if (selectedDates.size === 0) return;
    const eventText = prompt('Enter event for selected days:');
    if (eventText !== null) {
        selectedDates.forEach(key => {
            notes[key] = eventText;
            const textarea = document.querySelector(`textarea[data-key="${key}"]`);
            if (textarea) textarea.value = eventText;
        });
        selectedDates.clear();
        renderCalendar();
    }
}


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('showDates').addEventListener('change', renderCalendar);
    renderCalendar();
});