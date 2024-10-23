//get liveclientdata url start
const riotLiveData = 'https://cors-anywhere.herokuapp.com/https://127.0.0.1:2999/liveclientdata/'

//actually get the data
async function getLiveData() {
    const url = `${riotLiveData}playerlist`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            credentials: 'same-origin'
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Error fetching data:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Request failed:', error);
        return null;
    }
}

async function getActivePlayerTeam() {
    try {
        const activePlayerResponse = await fetch(`${riotLiveData}activeplayername`);
        const activePlayerName = await activePlayerResponse.json();

        const playersResponse = await fetch('https://127.0.0.1:2999/liveclientdata/playerlist');
        const playersData = await playersResponse.json();

        const playersResponse = await fetch(`${riotLiveData}playerlist`);
        return activePlayerData ? activePlayerData.team : null;
    } catch (error) {
        console.error('Error fetching active player or player list:', error);
        return null;
    }
}

// Helper function to calculate total gold for a player
function calculateTotalGold(player) {
    return Math.floor(player.items.reduce((acc, item) => acc + item.price, 0) + player.currentGold);
}

// Display stats for teams
function displayTeamStats(teamStats, teamListId) {
    const teamList = document.getElementById(teamListId);
    teamList.innerHTML = '';  // Clear existing content

    teamStats.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = `${player.name} - Kills: ${player.kills}, Deaths: ${player.deaths}, Assists: ${player.assists}, CS: ${player.cs}, Gold: ${player.totalGold}`;
        teamList.append(listItem);
    });
}

// Fetch and display live game data
async function gameInformation() {
    const playerData = await getLiveData();
    if (!playerData) return;

    const teamOrder = playerData.filter(player => player.team === 'ORDER');
    const teamChaos = playerData.filter(player => player.team === 'CHAOS');

    const teamOrderStats = teamOrder.map(player => ({
        name: player.riotIdGameName,
        kills: player.scores.kills,
        cs: player.scores.creepScore,
        deaths: player.scores.deaths,
        assists: player.scores.assists,
        totalGold: calculateTotalGold(player)
    }));

    const teamChaosStats = teamChaos.map(player => ({
        name: player.riotIdGameName,
        kills: player.scores.kills,
        cs: player.scores.creepScore,
        deaths: player.scores.deaths,
        assists: player.scores.assists,
        totalGold: calculateTotalGold(player)
    }));

    displayTeamStats(teamOrderStats, 'order-list');
    displayTeamStats(teamChaosStats, 'chaos-list');
}

// Calculate kills difference
async function getPlayerKillsDifference() {
    const activePlayerTeam = await getActivePlayerTeam();
    if (!activePlayerTeam) return null;

    const playersData = await getLiveData();
    if (!playersData) return null;

    const teamChaosKills = playersData
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + player.scores.kills, 0);
    
    const teamOrderKills = playersData
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + player.scores.kills, 0);

    return activePlayerTeam === 'ORDER' ? teamOrderKills - teamChaosKills : teamChaosKills - teamOrderKills;
}

// Calculate deaths difference
async function getPlayerDeathsDifference() {
    const activePlayerTeam = await getActivePlayerTeam();
    if (!activePlayerTeam) return null;

    const playersData = await getLiveData();
    if (!playersData) return null;

    const teamChaosDeaths = playersData
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + player.scores.deaths, 0);
    
    const teamOrderDeaths = playersData
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + player.scores.deaths, 0);

    return activePlayerTeam === 'ORDER' ? teamOrderDeaths - teamChaosDeaths : teamChaosDeaths - teamOrderDeaths;
}

// Calculate assists difference
async function getPlayerAssistsDifference() {
    const activePlayerTeam = await getActivePlayerTeam();
    if (!activePlayerTeam) return null;

    const playersData = await getLiveData();
    if (!playersData) return null;

    const teamChaosAssists = playersData
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + player.scores.assists, 0);
    
    const teamOrderAssists = playersData
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + player.scores.assists, 0);

    return activePlayerTeam === 'ORDER' ? teamOrderAssists - teamChaosAssists : teamChaosAssists - teamOrderAssists;
}

// Calculate CS difference
async function getPlayerCSDifference() {
    const activePlayerTeam = await getActivePlayerTeam();
    if (!activePlayerTeam) return null;

    const playersData = await getLiveData();
    if (!playersData) return null;

    const teamChaosCS = playersData
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + player.scores.creepScore, 0);
    
    const teamOrderCS = playersData
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + player.scores.creepScore, 0);

    return activePlayerTeam === 'ORDER' ? teamOrderCS - teamChaosCS : teamChaosCS - teamOrderCS;
}

// Calculate total gold difference
async function getPlayerTotalGoldDifference() {
    const activePlayerTeam = await getActivePlayerTeam();
    if (!activePlayerTeam) return null;

    const playersData = await getLiveData();
    if (!playersData) return null;

    const teamChaosGold = playersData
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + calculateTotalGold(player), 0);
    
    const teamOrderGold = playersData
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + calculateTotalGold(player), 0);

    return activePlayerTeam === 'ORDER' ? teamOrderGold - teamChaosGold : teamChaosGold - teamOrderGold;
}

// Calculate win probability based on differences
async function calculateWinProbability() {
    const killsDiff = await getPlayerKillsDifference();
    const deathsDiff = await getPlayerDeathsDifference();
    const assistsDiff = await getPlayerAssistsDifference();
    const csDiff = await getPlayerCSDifference();
    const goldDiff = await getPlayerTotalGoldDifference();

    // Factors to weigh each stat's importance in calculating win probability
    const weights = {
        kills: 0.3,
        deaths: 0.3,
        assists: 0.1,
        cs: 0.15,
        gold: 0.15
    };

    // Calculate weighted sum for win probability
    const winScore = (
        (killsDiff * weights.kills) +
        (deathsDiff * weights.deaths) +
        (assistsDiff * weights.assists) +
        (csDiff * weights.cs) +
        (goldDiff * weights.gold)
    );

    // Normalize win score into probability (assuming winScore range from -100 to +100)
    const winProbability = Math.min(Math.max((winScore + 100) / 200, 0), 1);

    return (winProbability * 100).toFixed(2); // Return as a percentage
}

// Update all stats differences, including win probability, and display in the DOM
async function updateAllStatsInDOM() {
    const killsDiff = await getPlayerKillsDifference();
    const deathsDiff = await getPlayerDeathsDifference();
    const assistsDiff = await getPlayerAssistsDifference();
    const csDiff = await getPlayerCSDifference();
    const goldDiff = await getPlayerTotalGoldDifference();
    const winProbability = await calculateWinProbability();

    const statsHtml = `
        <p>Kills Difference: ${killsDiff}</p>
        <p>Deaths Difference: ${deathsDiff}</p>
        <p>Assists Difference: ${assistsDiff}</p>
        <p>CS Difference: ${csDiff}</p>
        <p>Total Gold Difference: ${goldDiff}</p>
        <p>Win Probability: ${winProbability}%</p>
    `;
    updateTeamStatsInDOM(statsHtml);
}

// Function to display data in the DOM
function updateTeamStatsInDOM(statsHtml) {
    const statsElement = document.getElementById('compare-team-stats');
    if (statsElement) {
        statsElement.innerHTML = statsHtml;
    } else {
        console.error('Element with ID "compare-team-stats" not found.');
    }
}

// Event listener to fetch data and update stats after page load
document.addEventListener('DOMContentLoaded', () => {
    gameInformation();
    updateAllStatsInDOM();
});
