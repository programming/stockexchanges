// Function to get countdown for a specific exchange by acronym
function getCountdownByAcronym(acronym) {
    const exchange = exchanges.find(exchange => exchange.acronym === acronym);
    
    if (exchange) {
        return getCountdown(exchange);
    } else {
        return {
            exchangeAcronym: "N/A",
            exchangeName: "Unknown Exchange",
            eventType: "N/A",
            timeRemaining: "Exchange not found."
        };
    }
}

function getCountdown(exchange) {
    const now = new Date();
    const exchangeTimeZone = exchange.timeZone;
    const openingTime = exchange.openingTime;
    const closingTime = exchange.closingTime;
    const holidays = exchange.holidays;

    // Adjust current time to exchange's time zone
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: exchangeTimeZone }));

    // Check if today is a holiday
    const todayStr = localTime.toISOString().split('T')[0]; // Get YYYY-MM-DD format of today
    if (holidays.includes(todayStr)) {
        return {
            exchangeAcronym: exchange.acronym,
            exchangeName: exchange.name,
            eventType: 'closed',
            timeRemaining: 'The exchange is closed today due to a holiday.'
        };
    }

    // Get today's date and set the opening, closing times
    const exchangeOpenTime = new Date(localTime);
    exchangeOpenTime.setHours(openingTime.hours, openingTime.minutes, 0, 0);

    const exchangeCloseTime = new Date(localTime);
    exchangeCloseTime.setHours(closingTime.hours, closingTime.minutes, 0, 0);

    let eventTime = 0;
    let eventType = '';

    // If today is a working day but past the closing time, calculate the countdown to the next working day
    if (localTime >= exchangeCloseTime) {
        eventType = 'open';
        eventTime = calculateNextWorkingDayCountdown(exchange, localTime);
    } else if (localTime >= exchangeOpenTime && localTime < exchangeCloseTime) {
        eventType = 'close';
        eventTime = exchangeCloseTime - localTime;
    } else {
        eventType = 'open';
        eventTime = exchangeOpenTime - localTime;
    }

    const hours = Math.floor(eventTime / 3600000);
    const minutes = Math.floor((eventTime % 3600000) / 60000);
    const seconds = Math.floor((eventTime % 60000) / 1000);

    return {
        exchangeAcronym: exchange.acronym,
        exchangeName: exchange.name,
        eventType,
        timeRemaining: `${hours} hours, ${minutes} minutes, and ${seconds} seconds`
    };
}

// Function to calculate countdown to the next working day's opening time
function calculateNextWorkingDayCountdown(exchange, currentTime) {
    let nextOpenTime = new Date(currentTime);
    let nextDay = nextOpenTime.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, 2 = Tuesday, ...)

    const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    // If it's past market closing time today, move to the next working day.
    if (nextOpenTime >= new Date(nextOpenTime.setHours(exchange.closingTime.hours, exchange.closingTime.minutes, 0, 0))) {
        nextOpenTime.setDate(nextOpenTime.getDate() + 1); // Move to the next day
        nextDay = nextOpenTime.getDay(); // Recalculate the next day of the week
    }

    // Find the next working day
    while (exchange[daysOfWeek[nextDay]] === 0 || exchange.holidays.includes(nextOpenTime.toISOString().split('T')[0])) {
        nextOpenTime.setDate(nextOpenTime.getDate() + 1); // Move to the next day
        nextDay = nextOpenTime.getDay(); // Recalculate the next day of the week
    }

    // Set the opening time for the next valid working day (e.g., Sunday at 10:00 for TADAWUL)
    nextOpenTime.setHours(exchange.openingTime.hours, exchange.openingTime.minutes, 0, 0);

    // Calculate the difference in time from the current time to the next market open time
    return nextOpenTime - currentTime;
}

// Function to update the countdown for a specific exchange
function updateCountdown(acronym) {
    const countdown = getCountdownByAcronym(acronym);
    const countdownTimerContainer = document.getElementById('countdownTimer');
    countdownTimerContainer.innerHTML = ''; // Clear existing countdowns

    // Create a div for the selected exchange's countdown
    const exchangeDiv = document.createElement('div');
    let eventMessage = '';

    if (countdown.eventType === 'open') {
        eventMessage = `The ${countdown.exchangeName} (${countdown.exchangeAcronym}) will open in ${countdown.timeRemaining}.`;
    } else if (countdown.eventType === 'close') {
        eventMessage = `The ${countdown.exchangeName} (${countdown.exchangeAcronym}) will close in ${countdown.timeRemaining}.`;
    }

    exchangeDiv.innerHTML = eventMessage;
    countdownTimerContainer.appendChild(exchangeDiv);
}